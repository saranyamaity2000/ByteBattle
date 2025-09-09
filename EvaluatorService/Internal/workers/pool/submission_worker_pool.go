package pool

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"

	rabbitmq "github.com/rabbitmq/amqp091-go"
	"maitysaranya.com/EvaluatorService/Internal/models"
	"maitysaranya.com/EvaluatorService/Internal/services"
)

// SubmissionWorkerPool manages n workers, each with its own RabbitMQ channel
type SubmissionWorkerPool struct {
	rabbitQueueConnection *rabbitmq.Connection
	queueName             string
	workerCount           int
	ctx                   context.Context
	cancel                context.CancelFunc
	wg                    sync.WaitGroup
	submissionService     services.SubmissionService
}

// NewSubmissionWorkerPool creates a new worker pool
func NewSubmissionWorkerPool(rabbitQueueConnection *rabbitmq.Connection, queueName string, workerCount int) *SubmissionWorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	return &SubmissionWorkerPool{
		rabbitQueueConnection: rabbitQueueConnection,
		queueName:             queueName,
		workerCount:           workerCount,
		ctx:                   ctx,
		cancel:                cancel,
	}
}

func (pool *SubmissionWorkerPool) Start() (*sync.WaitGroup, error) {
	log.Printf("Starting %d workers for queue '%s'", pool.workerCount, pool.queueName)

	for i := 1; i <= pool.workerCount; i++ {
		pool.wg.Add(1)
		go pool.startWorker(i)
	}
	return &pool.wg, nil
}

// Stop gracefully shuts down all workers
func (pool *SubmissionWorkerPool) Stop() {
	log.Println("Stopping worker pool...")
	pool.cancel() // Signal all workers to stop
	pool.wg.Wait()
	log.Println("All workers stopped")
}

func (pool *SubmissionWorkerPool) startWorker(workerID int) {
	defer pool.wg.Done()

	// Create channel for this worker
	ch, err := pool.rabbitQueueConnection.Channel()
	if err != nil {
		log.Printf("Worker %d: Failed to create channel: %v", workerID, err)
		return
	}
	defer ch.Close() // close channel when worker exits

	// Declare the queue
	_, err = ch.QueueDeclare(
		pool.queueName, // queue name
		true,           // durable
		false,          // auto delete
		false,          // exclusive
		false,          // no wait
		nil,            // arguments
	)
	if err != nil {
		log.Printf("Worker %d: Failed to declare queue: %v", workerID, err)
		return
	}

	// Set QoS to process one message at a time
	err = ch.Qos(1, 0, false)
	if err != nil {
		log.Printf("Worker %d: Failed to set QoS: %v", workerID, err)
		return
	}

	// Start consuming messages
	messages, err := ch.Consume(
		pool.queueName, // queue
		"",             // consumer tag
		false,          // auto ack (we'll ack manually)
		false,          // exclusive
		false,          // no local
		false,          // no wait
		nil,            // args
	)
	if err != nil {
		log.Printf("Worker %d: Failed to start consuming: %v", workerID, err)
		return
	}

	log.Printf("Worker %d: Started and waiting for submissions...", workerID)

	// Process the incoming messages
	for {
		select {
		case <-pool.ctx.Done():
			log.Printf("Worker %d: Received shutdown signal, stopping...", workerID)
			return
		case message, ok := <-messages:
			if !ok {
				log.Printf("Worker %d: Message channel closed, stopping...", workerID)
				return
			}
			log.Printf("Worker %d: Received submission", workerID)

			// Process the submission
			if err := pool.processRawSubmission(workerID, message.Body); err != nil {
				log.Printf("Worker %d: Failed to process submission: %v", workerID, err)
				// Reject and requeue the message
				message.Nack(false, true)
			} else {
				log.Printf("Worker %d: Successfully processed submission", workerID)
				// Acknowledge the message
				message.Ack(false)
			}
		}
	}
}

// processRawSubmission handles a single submission
func (pool *SubmissionWorkerPool) processRawSubmission(workerID int, rawSubmissionData []byte) error {
	var submission models.ProblemSubmission

	if err := json.Unmarshal(rawSubmissionData, &submission); err != nil {
		return fmt.Errorf("failed to parse submission JSON: %w", err)
	}

	log.Printf("Worker %d: Processing submission %s (%s)", workerID, submission.SubmissionID, submission.Language)
	log.Printf("Worker %d: Code: %s", workerID, submission.Code)

	result, err := pool.submissionService.EvaluateSubmission(submission)

	if err != nil {
		return fmt.Errorf("evaluation failed: %w", err)
	}
	log.Printf("Worker %d: Evaluation succeeded for %s: %s", workerID, submission.SubmissionID, result)
	return nil
}
