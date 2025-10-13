# Evaluator Service - ByteBattle

High-performance Go-based worker service that evaluates code submissions in sandboxed Docker containers. Consumes submissions from RabbitMQ, executes code safely, and returns evaluation results.

## Features

- 🐹 Built with Go for high performance
- 🐳 Docker-based sandboxed code execution
- 📨 RabbitMQ message queue consumer
- 🔒 Secure and isolated execution environment
- ⚡ Concurrent submission processing with worker pools
- 🎯 Support for multiple programming languages

## Tech Stack

- **Language**: Go 1.24
- **Containerization**: Docker SDK for Go
- **Message Queue**: RabbitMQ (AMQP 0.9.1)
- **Environment**: dotenv for configuration

## Prerequisites

- Go 1.24 or higher
- Docker and Docker Desktop installed and running
- RabbitMQ server (can be started from SubmissionService)
- Make (optional, for build automation)

## Local Setup

### 1. Install Go Dependencies

```bash
cd EvaluatorService
go mod download
```

### 2. Start RabbitMQ

The evaluator service requires RabbitMQ. Start it from the SubmissionService directory:

```bash
cd ../SubmissionService
npm run rabbitmq-start
```

RabbitMQ will be available at:
- **AMQP**: amqp://localhost:5672
- **Management UI**: http://localhost:15672 (guest/guest)

### 3. Environment Configuration

Create a `.env` file in the EvaluatorService directory:

```env
# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
QUEUE_NAME=submission_queue
POOL_SIZE=2
```

**Environment Variables:**
- `RABBITMQ_URL` - RabbitMQ connection string (default: `amqp://guest:guest@localhost:5672/`)
- `QUEUE_NAME` - Name of the queue to consume from (default: `submission_queue`)
- `POOL_SIZE` - Number of concurrent worker goroutines (default: `2`)

### 4. Verify Docker is Running

```bash
# Check Docker status
docker ps

# If Docker is not running, start Docker Desktop
```

### 5. Start the Evaluator Service

```bash
# Run directly
go run cmd/main.go

# Or build and run
go build -o evaluator cmd/main.go
./evaluator
```

The service will:
1. Connect to RabbitMQ
2. Create a worker pool
3. Start consuming messages from the submission queue
4. Process submissions in Docker containers

## Available Commands

```bash
# Download dependencies
go mod download

# Run the service
go run cmd/main.go

# Build the binary
go build -o evaluator cmd/main.go

# Run tests
go test ./...

# Format code
go fmt ./...

# Run linter (requires golangci-lint)
golangci-lint run

# Tidy dependencies
go mod tidy
```

## Project Structure

```
EvaluatorService/
├── cmd/
│   └── main.go                    # Application entry point
├── Internal/
│   ├── config/
│   │   ├── env_config.go          # Environment configuration
│   │   └── rabbitmq.go            # RabbitMQ connection setup
│   ├── models/
│   │   └── submission.go          # Submission data structures
│   ├── services/
│   │   ├── submission_service.go  # Business logic
│   │   └── docker_service.go      # Docker execution
│   ├── workers/
│   │   ├── setup/
│   │   │   └── worker_setup.go    # Worker pool initialization
│   │   └── submission_worker.go   # Message consumer
│   └── utility/
│       └── env/
│           └── env_reader.go      # Environment variable reader
├── .env.example
├── go.mod
└── go.sum
```

## How It Works

### Workflow

```
1. RabbitMQ Queue (submission_queue)
        ↓
2. Worker Pool (2 workers by default)
        ↓
3. Docker Container Creation
        ↓
4. Code Execution (with time/memory limits)
        ↓
5. Test Case Evaluation
        ↓
6. Result Aggregation
        ↓
7. Result sent back to Submission Service
```

### Message Processing

1. **Consume Message**: Worker receives submission from RabbitMQ
2. **Parse Submission**: Extract problem ID, code, and language
3. **Create Container**: Spin up language-specific Docker container
4. **Execute Code**: Run code with test cases
5. **Collect Results**: Gather output, execution time, memory usage
6. **Evaluate**: Compare output with expected results
7. **Send Results**: Update submission status via API call
8. **Acknowledge**: Confirm message processing to RabbitMQ

## Docker Execution

### Supported Languages

The service supports multiple programming languages, each with its own Docker image:

- **Python**: `python:3.11-slim`
- **JavaScript**: `node:18-alpine`
- **Java**: `openjdk:17-slim`
- **C++**: `gcc:latest`
- **Go**: `golang:1.20-alpine`

### Container Configuration

Each code execution runs in an isolated container with:
- **Time Limit**: Configurable (default: 2 seconds)
- **Memory Limit**: Configurable (default: 256 MB)
- **Network**: Disabled (no internet access)
- **Read-only Root**: Security enhancement
- **Auto-removal**: Container cleanup after execution

### Example Container Execution

```go
containerConfig := &container.Config{
    Image: "python:3.11-slim",
    Cmd:   []string{"python", "solution.py"},
}

hostConfig := &container.HostConfig{
    Resources: container.Resources{
        Memory:    256 * 1024 * 1024,  // 256 MB
        CPUQuota:  50000,               // 50% CPU
    },
    NetworkMode: "none",
    ReadonlyRootfs: true,
}
```

## Worker Pool

### Configuration

Workers are configured via `POOL_SIZE` environment variable:

```go
poolSize := config.AppConfig.PoolSize // Default: 2
```

### Concurrency Model

- Multiple goroutines process submissions concurrently
- Each worker has its own RabbitMQ channel
- Safe concurrent access to Docker API
- Graceful shutdown handling

### Example Worker Implementation

```go
func StartWorker(channel *amqp.Channel, queueName string) {
    msgs, _ := channel.Consume(queueName, "", false, false, false, false, nil)
    
    for msg := range msgs {
        // Process submission
        result := evaluateSubmission(msg.Body)
        
        // Acknowledge message
        msg.Ack(false)
    }
}
```

## RabbitMQ Integration

### Message Format

Expected message structure from Submission Service:

```json
{
  "problemId": "507f1f77bcf86cd799439011",
  "submissionId": "507f1f77bcf86cd799439012",
  "code": "def solution(nums):\n    return sum(nums)",
  "lang": "python"
}
```

### Queue Configuration

- **Queue Name**: `submission_queue` (configurable)
- **Durability**: Durable queue
- **Auto-delete**: false
- **Exclusive**: false
- **Prefetch Count**: 1 (per worker)

### Connection Management

- Automatic reconnection on connection loss
- Connection pooling for workers
- Graceful shutdown with message acknowledgment

## Evaluation Process

### Steps

1. **Fetch Test Cases**: Download from Problem Service
2. **Prepare Code**: Inject test case inputs
3. **Create Container**: Select appropriate Docker image
4. **Execute**: Run code with timeout and memory limits
5. **Capture Output**: Collect stdout, stderr, exit code
6. **Compare Results**: Match output with expected results
7. **Calculate Score**: Based on test cases passed
8. **Generate Report**: Create evaluation result

### Verdict Types

- `accepted` - All test cases passed
- `wrong_answer` - Output doesn't match expected
- `time_limit_exceeded` - Execution time exceeded limit
- `memory_limit_exceeded` - Memory usage exceeded limit
- `runtime_error` - Code crashed or threw exception
- `compilation_error` - Code failed to compile (for compiled languages)

### Result Format

```go
type SubmissionResult struct {
    Verdict          string  `json:"verdict"`
    Score            int     `json:"score"`
    ExecutionTime    int     `json:"executionTime"`    // milliseconds
    MemoryUsed       int     `json:"memoryUsed"`       // KB
    TestCasesPassed  int     `json:"testCasesPassed"`
    TotalTestCases   int     `json:"totalTestCases"`
    Error            string  `json:"error,omitempty"`
}
```

## Error Handling

### Retry Mechanism

- Failed message processing: Requeue message
- Docker errors: Retry with exponential backoff
- Network errors: Connection retry logic

### Logging

Structured logging throughout the service:

```go
log.Printf("Processing submission: %s", submissionId)
log.Printf("Execution time: %dms", executionTime)
log.Printf("Error: %v", err)
```

## Performance Optimization

### Concurrent Processing

- Multiple workers process submissions in parallel
- Non-blocking message consumption
- Efficient goroutine management

### Docker Optimization

- Container reuse where possible
- Cached Docker images
- Minimal base images (alpine, slim)
- Fast container startup

### Resource Management

- CPU and memory limits per container
- Automatic container cleanup
- Connection pooling

## Monitoring

### Health Checks

Monitor service health:
- RabbitMQ connection status
- Docker daemon status
- Worker pool status
- Message processing rate

### Metrics to Track

- Submissions processed per minute
- Average execution time
- Success/failure rate
- Queue depth
- Docker container count

### RabbitMQ Management UI

Monitor at http://localhost:15672:
- Queue messages count
- Consumer count
- Message rates
- Acknowledgment rates

## Troubleshooting

### RabbitMQ Connection Issues

```bash
# Check RabbitMQ status
docker ps | grep rabbitmq

# Restart RabbitMQ
cd SubmissionService
npm run rabbitmq-stop
npm run rabbitmq-start

# Check connection in .env
cat .env | grep RABBITMQ_URL
```

### Docker Issues

```bash
# Verify Docker is running
docker ps

# Check Docker daemon
docker info

# Restart Docker Desktop
# (OS-specific, use Docker Desktop app)

# Pull required images manually
docker pull python:3.11-slim
docker pull node:18-alpine
docker pull openjdk:17-slim
```

### Worker Not Processing

```bash
# Check queue has messages
# Visit http://localhost:15672 → Queues → submission_queue

# Verify .env configuration
cat .env

# Check logs for errors
go run cmd/main.go 2>&1 | grep -i error
```

### Build Errors

```bash
# Clean and rebuild
go clean
go mod tidy
go build -o evaluator cmd/main.go

# Update dependencies
go get -u ./...
go mod tidy
```

## Security Considerations

### Sandboxing

- **Network Isolation**: Containers have no network access
- **Resource Limits**: CPU and memory constraints
- **Read-only Filesystem**: Prevents file system modifications
- **No Privileged Mode**: Containers run with minimal permissions

### Code Execution Safety

- **Timeout Enforcement**: Prevents infinite loops
- **Memory Limits**: Prevents memory bombs
- **Container Isolation**: Each execution is isolated
- **Auto-cleanup**: Containers removed after execution

### Best Practices

- Don't run as root user in containers
- Use official, trusted Docker images
- Regularly update Docker images
- Monitor resource usage
- Implement rate limiting (future)

## Development Tips

### Testing Locally

1. Start RabbitMQ
2. Create a test submission via Submission Service API
3. Watch evaluator logs for processing
4. Check submission status via API

### Debugging

```bash
# Run with verbose logging
LOG_LEVEL=debug go run cmd/main.go

# Check Docker container logs
docker ps -a
docker logs <container_id>

# Monitor resource usage
docker stats
```

### Adding Support for New Languages

1. Define language configuration in `docker_service.go`
2. Add Docker image for the language
3. Create code template/wrapper
4. Update submission model
5. Test with sample code

## Production Considerations

### Scaling

- Increase `POOL_SIZE` for more concurrent processing
- Run multiple instances of the service
- Use load balancing for RabbitMQ
- Consider Kubernetes for orchestration

### Monitoring

- Implement health check endpoints
- Use Prometheus for metrics
- Set up alerting for failures
- Monitor Docker resource usage

### Deployment

- Use Docker for deployment
- Set appropriate resource limits
- Configure proper logging
- Use orchestration (Kubernetes/Docker Swarm)

## Future Enhancements

- [ ] Support for more programming languages
- [ ] Custom test case execution
- [ ] Code complexity analysis
- [ ] Execution replay and debugging
- [ ] Distributed evaluation across multiple nodes
- [ ] GPU support for ML problems
- [ ] Real-time execution streaming

## Contributing

1. Follow Go best practices and conventions
2. Write unit tests for new features
3. Use `go fmt` for code formatting
4. Run `go vet` for code analysis
5. Update documentation

## Dependencies

Key Go modules:
- `github.com/docker/docker` - Docker SDK for Go
- `github.com/rabbitmq/amqp091-go` - RabbitMQ client
- `github.com/joho/godotenv` - Environment variable management

## License

ISC License
