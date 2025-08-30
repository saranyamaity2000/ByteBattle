# ByteBattle Submission Service

A TypeScript-based microservice for handling code submission management in the ByteBattle platform.

## Overview

This service provides a REST API for managing code submissions, storing them in MongoDB, and tracking their execution status. The service has been designed with strong TypeScript typing and follows modern Node.js best practices.

## Features

-   **Code Submission Management**: Create, retrieve, and update code submissions
-   **Multiple Language Support**: Currently supports C++ and Python3
-   **MongoDB Integration**: Persistent storage with strong typing
-   **Status Tracking**: Track submission progress from pending to completed
-   **Result Management**: Store execution results, verdicts, and performance metrics
-   **RESTful API**: Clean HTTP API with proper error handling
-   **Health Monitoring**: Built-in health check endpoints
-   **TypeScript**: Full TypeScript support with strict type checking

## API Endpoints

### Submissions

-   `POST /api/v1/submissions` - Create a new submission
-   `GET /api/v1/submissions/:id` - Get specific submission details
-   `PATCH /api/v1/submissions/:id` - Update submission status and results
-   `GET /api/v1/submissions?problemId=<id>` - Get submissions for a problem
-   `GET /api/v1/submissions?userId=<id>` - Get submissions for a user
-   `GET /api/v1/submissions/health` - Service health check

## Data Models

### Submission

```typescript
interface Submission {
	_id?: ObjectId;
	problemId: string;
	lang: SupportedSubmissionLang;
	code: string;
	userId?: string;
	status: SubmissionStatus;
	result?: SubmissionResult;
	createdAt: Date;
	updatedAt: Date;
}
```

### Supported Languages

-   C++ (`c++`)
-   Python 3 (`python3`)

### Submission Status

-   `pending` - Submission received, waiting for processing
-   `processing` - Currently being executed
-   `completed` - Execution finished
-   `failed` - Execution failed

### Submission Verdicts

-   `accepted` - All test cases passed
-   `wrong_answer` - Incorrect output
-   `time_limit_exceeded` - Execution took too long
-   `runtime_error` - Code crashed during execution
-   `compilation_error` - Code failed to compile

## Installation & Setup

### Prerequisites

-   Node.js 18+
-   MongoDB 4.4+
-   TypeScript 5.0+

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start in development mode
npm run dev

# Start in production mode
npm start
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/submission-service
```

## Architecture

The service follows a clean architecture pattern:

```
src/
├── index.ts              # Application entry point
├── configs/              # Configuration management
├── models/               # TypeScript interfaces and types
├── services/             # Business logic layer
└── router/               # HTTP route handlers
    └── v1/               # API version 1 routes
```

## TypeScript Configuration

The project uses strict TypeScript configuration with:

-   `strict: true` - All strict type checking options
-   `exactOptionalPropertyTypes: true` - Strict optional property handling
-   `noUncheckedIndexedAccess: true` - Safe array/object access
-   Full type coverage for MongoDB operations

## Recent Changes

### RabbitMQ Removal

-   Removed RabbitMQ message queue integration for simplified deployment
-   See `RABBITMQ_INTEGRATION.md` for future integration guide
-   Service now operates synchronously with direct HTTP responses

### TypeScript Improvements

-   Enhanced type safety with strict configuration
-   Better error handling and logging
-   Improved MongoDB type definitions
-   Optional property handling compliance

## Development

### Running Tests

```bash
npm test
```

### Code Quality

The project includes:

-   ESBuild for fast compilation
-   Strict TypeScript checking
-   Comprehensive error handling
-   Structured logging with Fastify

### API Testing

Example submission creation:

```bash
curl -X POST http://localhost:3000/api/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "problem_123",
    "lang": "python3",
    "code": "print(\"Hello World\")",
    "userId": "user_456"
  }'
```

## Deployment

### Docker

```bash
# Build image
docker build -t submission-service .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/submission-service \
  submission-service
```

### Production Considerations

-   Use MongoDB replica sets for high availability
-   Implement request rate limiting
-   Add authentication/authorization
-   Set up monitoring and alerting
-   Consider implementing caching for frequently accessed data

## Future Enhancements

-   RabbitMQ integration for asynchronous processing (see integration guide)
-   Authentication and authorization
-   Rate limiting and request validation
-   Caching layer for improved performance
-   Metrics and monitoring integration
-   Support for additional programming languages

## Contributing

1. Follow TypeScript strict mode requirements
2. Maintain comprehensive error handling
3. Add appropriate type definitions
4. Update documentation for API changes
5. Ensure backward compatibility
