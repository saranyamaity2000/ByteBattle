# Submission Service - ByteBattle

High-performance submission management service built with Fastify and TypeScript. Handles code submission processing, queuing to RabbitMQ for evaluation, and result management.

## Features

- 🚀 Fast HTTP server with Fastify
- 📨 RabbitMQ integration for async evaluation
- 💾 MongoDB for submission persistence
- 📊 Submission status tracking
- 🔄 Real-time submission updates
- ⚡ High-performance architecture

## Tech Stack

- **Runtime**: Node.js 18.x+
- **Framework**: Fastify 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Message Queue**: RabbitMQ (AMQP)
- **Build Tool**: esbuild

## Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 4.4 or higher
- Docker Desktop (for RabbitMQ)
- npm or yarn package manager

## Local Setup

### 1. Install Dependencies

```bash
cd SubmissionService
npm install
```

### 2. Start RabbitMQ

The service requires RabbitMQ for the submission queue. Start it using Docker:

```bash
# Start RabbitMQ with management UI
npm run rabbitmq-start

# Stop RabbitMQ when done
npm run rabbitmq-stop
```

RabbitMQ will be available at:
- **AMQP**: amqp://localhost:5672
- **Management UI**: http://localhost:15672 (username: `guest`, password: `guest`)

### 3. Environment Configuration

Create a `.env` file in the SubmissionService directory:

```env
# Server Configuration
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/submission-service

# Logging
LOG_LEVEL=info

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_UI_URL=http://localhost:15672
```

### 4. Start MongoDB

#### Option A: Local MongoDB
```bash
mongod --dbpath /path/to/data/directory
```

#### Option B: MongoDB Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: MongoDB Atlas
Use the connection string from MongoDB Atlas in your `.env` file.

### 5. Start the Server

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm run start
```

The service will be available at: **http://localhost:3000**

## Available Scripts

- `npm run dev` - Start development server with tsx watch (auto-reload)
- `npm run start` - Build with esbuild and start production server
- `npm run build` - Build the application using esbuild
- `npm test` - Run test suite (to be implemented)
- `npm run rabbitmq-start` - Start RabbitMQ using Docker Compose
- `npm run rabbitmq-stop` - Stop RabbitMQ containers

## API Endpoints

### Submission Management

#### Create Submission
```http
POST /api/v1/submissions
Content-Type: application/json

{
  "problemId": "507f1f77bcf86cd799439011",
  "code": "def solution(nums):\n    return sum(nums)",
  "lang": "python",
  "userId": "user123"  // optional
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "problemId": "507f1f77bcf86cd799439011",
  "lang": "python",
  "code": "def solution...",
  "status": "pending",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

#### Get Submission Status
```http
GET /api/v1/submissions/:id
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "problemId": "507f1f77bcf86cd799439011",
  "lang": "python",
  "status": "completed",
  "result": {
    "verdict": "accepted",
    "score": 100,
    "executionTime": 45,
    "memoryUsed": 12800,
    "testCasesPassed": 10,
    "totalTestCases": 10
  },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:30.000Z"
}
```

#### Update Submission Status (Internal)
```http
PUT /api/v1/submissions/:id
Content-Type: application/json

{
  "status": "completed",
  "result": {
    "verdict": "accepted",
    "score": 100,
    "executionTime": 45,
    "memoryUsed": 12800,
    "testCasesPassed": 10,
    "totalTestCases": 10
  }
}
```

## Project Structure

```
SubmissionService/
├── src/
│   ├── configs/
│   │   ├── index.ts              # Environment config
│   │   ├── db.config.ts          # MongoDB connection
│   │   ├── server.config.ts      # Fastify server config
│   │   └── rabitmq.config.ts     # RabbitMQ setup
│   ├── models/
│   │   └── submission.model.ts   # Mongoose schema
│   ├── repositories/
│   │   └── submission.repository.ts
│   ├── services/
│   │   ├── submission.service.ts
│   │   └── submission.publisher.service.ts
│   ├── controllers/
│   │   └── submission.controller.ts
│   ├── routes/
│   │   └── submission.routes.ts
│   ├── dtos/
│   │   └── submission.dto.ts     # Data transfer objects
│   ├── utils/
│   │   └── errors.ts             # Custom error classes
│   ├── server.ts                 # Fastify app setup
│   └── index.ts                  # Entry point
├── docker-compose.yaml           # RabbitMQ setup
├── .env.example
├── tsconfig.json
└── package.json
```

## Data Models

### Submission Schema

```typescript
{
  problemId: string;           // Reference to problem
  lang: "python" | "javascript" | "java" | "cpp" | "go";
  code: string;                // Submitted code
  userId?: string;             // Optional user identifier
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: {
    verdict: "accepted" | "wrong_answer" | "time_limit_exceeded" | 
             "memory_limit_exceeded" | "runtime_error" | "compilation_error";
    score?: number;            // 0-100
    executionTime?: number;    // in milliseconds
    memoryUsed?: number;       // in KB
    testCasesPassed?: number;
    totalTestCases?: number;
    error?: string;            // Error message if failed
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Supported Languages

- `python` - Python 3.x
- `javascript` - Node.js
- `java` - Java 11+
- `cpp` - C++17
- `go` - Go 1.20+

## RabbitMQ Integration

### Queue Architecture

1. **Submission Creation**: When a submission is created via API
2. **Publish to Queue**: Submission service publishes message to `submission_queue`
3. **Evaluator Consumes**: Evaluator service picks up messages from queue
4. **Result Update**: Evaluator sends results back, updating submission status

### Message Format

```typescript
{
  problemId: string;
  submissionId: string;
  code: string;
  lang: string;
}
```

### Queue Configuration

- **Queue Name**: `submission_queue`
- **Exchange**: Direct exchange (default)
- **Durability**: Durable queue for reliability
- **Acknowledgment**: Manual acknowledgment

## Fastify Features

### Logging

Fastify provides structured logging:

```typescript
fastify.log.info("Submission created", { submissionId });
fastify.log.error("Database error", { error: err });
```

### Error Handling

Custom error classes for consistent responses:

```typescript
class NotFoundError extends Error {
  statusCode = 404;
}

class ValidationError extends Error {
  statusCode = 400;
}
```

### Request Validation

Built-in JSON schema validation for requests.

## Docker Compose

The included `docker-compose.yaml` sets up RabbitMQ:

```yaml
version: "3.9"
services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"    # AMQP port
      - "15672:15672"  # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
```

## Status Flow

```
pending → in_progress → completed
                     ↘ failed
```

- **pending**: Submission created, waiting in queue
- **in_progress**: Evaluator picked up submission
- **completed**: Evaluation finished successfully
- **failed**: Evaluation failed (internal error)

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Submission Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Submission not found with id: 123"
}
```

## Performance Optimization

### esbuild

Fast TypeScript compilation with esbuild:
- Bundle size reduction
- Fast cold starts
- External package handling

### Fastify Benefits

- Fast HTTP server (faster than Express)
- Low overhead
- Schema-based validation
- Async/await support

## Monitoring

### RabbitMQ Management UI

Access at http://localhost:15672:
- Monitor queue depth
- View message rates
- Check connection status
- Manage exchanges and queues

### Application Logs

Logs include:
- Submission creation events
- Queue publishing status
- MongoDB connection status
- Error tracking

## Troubleshooting

### RabbitMQ Connection Issues

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# Restart RabbitMQ
npm run rabbitmq-stop
npm run rabbitmq-start

# Check RabbitMQ logs
docker logs rabbitmq
```

### MongoDB Connection Issues

```bash
# Verify MongoDB is running
mongosh

# Check connection string in .env
echo $MONGODB_URI
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Testing Submissions

Use curl or Postman to test the API:

```bash
# Create a submission
curl -X POST http://localhost:3000/api/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "507f1f77bcf86cd799439011",
    "code": "def solution(nums):\n    return sum(nums)",
    "lang": "python"
  }'

# Get submission status
curl http://localhost:3000/api/v1/submissions/{id}
```

### Monitoring Queue

Check RabbitMQ management UI to see:
- Messages in queue
- Publishing rate
- Consumer status

### Database Queries

Access MongoDB to inspect submissions:

```bash
mongosh
use submission-service
db.submissions.find().pretty()
```

## Integration with Other Services

### Problem Service
- Fetches problem details for validation
- Retrieves test cases for evaluation

### Evaluator Service
- Consumes messages from RabbitMQ
- Runs code in sandboxed Docker containers
- Updates submission results

### Frontend
- Creates submissions via API
- Polls for submission status
- Displays evaluation results

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Redis caching for submission results
- [ ] Rate limiting per user
- [ ] Submission history and analytics
- [ ] Code plagiarism detection
- [ ] Batch submission support

## Security Considerations

- Validate all input data
- Sanitize code before storage
- Implement authentication (JWT)
- Add rate limiting
- Use secure RabbitMQ credentials in production
- Encrypt sensitive data

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages
5. Test with RabbitMQ and MongoDB

## License

ISC License
