package setup

import (
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"maitysaranya.com/EvaluatorService/Internal/config"
	"maitysaranya.com/EvaluatorService/Internal/factory"
	"maitysaranya.com/EvaluatorService/Internal/services"
	"maitysaranya.com/EvaluatorService/Internal/workers/pool"
)

func SetupRabbitMQWorkers() {
	rabbitConn, err := config.GetRabbitMQConnection()
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer rabbitConn.Close()

	dockerFactory := factory.NewDockerCodeFactory()
	dockerService := services.NewDockerService(dockerFactory)
	submissionService := services.NewSubmissionService(dockerService)
	workerPool := pool.NewSubmissionWorkerPool(
		rabbitConn,
		config.AppConfig.QueueName,
		config.AppConfig.PoolSize,
		submissionService,
	)

	wg, err := workerPool.Start()
	if err != nil {
		log.Fatalf("Failed to start submission worker pool: %v", err)
	}

	log.Println("Evaluator Service started successfully")
	log.Println("Press Ctrl+C to stop the service")

	// Wait for either interrupt signal OR all workers to exit
	waitForShutdownOrWorkerExit(wg)

	log.Println("Shutting down Evaluator Service...")
	workerPool.Stop() // This already waits for all workers internally
	log.Println("Evaluator Service stopped")
}

// waitForShutdownOrWorkerExit waits for either:
// 1. An interrupt signal (Ctrl+C, SIGTERM) - for graceful shutdown
// 2. All workers to exit (due to errors) - for automatic restart/failure handling
func waitForShutdownOrWorkerExit(wg *sync.WaitGroup) {
	// Channel for interrupt signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Channel to signal when all workers are done
	doneChan := make(chan struct{})

	// Monitor workers in a separate goroutine
	go func() {
		wg.Wait() // Wait for all workers to exit
		close(doneChan)
	}()

	// Wait for either signal or workers to complete (Bruteforce way)
	// select {
	// case _, ok := <-sigChan:
	// 	if ok { // means singal was received
	// 		log.Println("Received shutdown signal")
	// 	}
	// case _, ok := <-doneChan:
	// 	if !ok { // means doneChan was closed
	// 		log.Println("All workers have exited unexpectedly - initiating shutdown")
	// 	}
	// }
	select {
	case <-sigChan:
		log.Println("Received shutdown signal")
	case <-doneChan:
		log.Println("All workers have exited unexpectedly - initiating shutdown")
	}
}
