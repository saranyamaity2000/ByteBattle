# ByteBattle

ByteBattle is a comprehensive coding platform that allows users to solve programming problems with real-time code evaluation. The platform consists of a frontend client and three microservices working together to provide a seamless coding experience.

## Architecture Overview

The project follows a microservices architecture with the following components:

```
┌─────────────────┐
│    Frontend     │  ← User Interface (React + Vite)
│   (Port 5173)   │
└────────┬────────┘
         │
         ├──────────────────────────┬─────────────────────┐
         │                          │                     │
         ▼                          ▼                     ▼
┌────────────────┐      ┌──────────────────┐   ┌────────────────┐
│ Problem Service│      │Submission Service│   │                │
│  (Port 3001)   │      │   (Port 3000)    │   │   Frontend     │
│   MongoDB      │      │    MongoDB       │   │                │
└────────────────┘      └──────┬───────────┘   └────────────────┘
                               │
                               │ RabbitMQ
                               │
                               ▼
                      ┌────────────────┐
                      │Evaluator Service│
                      │   (Go Worker)   │
                      │    + Docker     │
                      └────────────────┘
```

## Components

### 1. Frontend
A modern React-based web application built with:
- **Framework**: React 19 + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Code Editor**: Monaco Editor
- **Routing**: React Router v7

### 2. Problem Service
RESTful API service for managing coding problems:
- **Stack**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Storage**: AWS S3 (for test cases)
- **Port**: 3001

### 3. Submission Service
Handles code submissions and manages the submission queue:
- **Stack**: Node.js + Fastify + TypeScript
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **Port**: 3000

### 4. Evaluator Service
Worker service that evaluates code submissions:
- **Language**: Go
- **Execution**: Docker containers (sandboxed)
- **Message Queue**: RabbitMQ (consumer)

## Quick Start

### Prerequisites

- **Node.js** 22.x or higher
- **Go** 1.24 or higher
- **MongoDB** 4.4 or higher
- **Docker** and Docker Desktop (for RabbitMQ and code execution)
- **npm** or **yarn**

### Setup All Services

1. **Clone the repository**
   ```bash
   git clone https://github.com/saranyamaity2000/ByteBattle.git
   cd ByteBattle
   ```

2. **Start RabbitMQ**
   ```bash
   cd SubmissionService
   npm run rabbitmq-start
   ```

3. **Setup and Start Problem Service**
   ```bash
   cd ProblemService
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

4. **Setup and Start Submission Service**
   ```bash
   cd SubmissionService
   npm install
   # Configure .env file with MongoDB and RabbitMQ URLs
   npm run dev
   ```

5. **Setup and Start Evaluator Service**
   ```bash
   cd EvaluatorService
   go mod download
   # Create .env file with RABBITMQ_URL and QUEUE_NAME
   go run cmd/main.go
   ```

6. **Setup and Start Frontend**
   ```bash
   cd Frontend
   npm install
   cp .env.example .env.development  # Configure API endpoint
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Problem Service: http://localhost:3001
   - Submission Service: http://localhost:3000
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

## Detailed Setup Guides

For detailed setup instructions for each component, please refer to:

- [Frontend Setup Guide](./Frontend/README.md)
- [Problem Service Setup Guide](./ProblemService/README.md)
- [Submission Service Setup Guide](./SubmissionService/README.md)
- [Evaluator Service Setup Guide](./EvaluatorService/README.md)

## Development Workflow

1. **Create a Problem** - Use Problem Service API to create coding problems with test cases
2. **Upload Test Cases** - Upload test case files via Problem Service
3. **Solve Problems** - Users write code in the Frontend editor
4. **Submit Code** - Frontend sends code to Submission Service
5. **Queue Submission** - Submission Service queues the submission to RabbitMQ
6. **Evaluate** - Evaluator Service picks up submissions, runs code in Docker, and returns results
7. **View Results** - Frontend displays evaluation results to the user

## Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Monaco Editor |
| **Problem Service** | Node.js, Express, TypeScript, MongoDB, AWS S3 |
| **Submission Service** | Node.js, Fastify, TypeScript, MongoDB, RabbitMQ |
| **Evaluator Service** | Go, Docker, RabbitMQ |
| **Infrastructure** | Docker, MongoDB, RabbitMQ |

## API Endpoints

### Problem Service (Port 3001)
- `GET /api/v1/problems` - Get all problems
- `GET /api/v1/problems/:slug` - Get problem by slug
- `POST /api/v1/problems` - Create a new problem
- `PUT /api/v1/problems/:slug` - Update a problem
- `DELETE /api/v1/problems/:slug` - Delete a problem
- `POST /api/v1/problems/:slug/testcases` - Upload test cases
- `GET /api/v1/problems/:slug/testcases` - Download test cases

### Submission Service (Port 3000)
- `POST /api/v1/submissions` - Create a submission
- `GET /api/v1/submissions/:id` - Get submission status/result
- `PUT /api/v1/submissions/:id` - Update submission status (internal)

## Environment Variables

### Frontend
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

### Problem Service
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/problem-service
AWS_ACCESS_KEY_ID=your_access_key
AWS_ACCESS_KEY_SECRET=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your_bucket_name
ALLOWED_ORIGINS=http://localhost:5173
```

### Submission Service
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/submission-service
LOG_LEVEL=info
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_UI_URL=http://localhost:15672
```

### Evaluator Service
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
POOL_SIZE=2
QUEUE_NAME=submission_queue
```

## Testing

Each service has its own test suite:

```bash
# Problem Service
cd ProblemService
npm test
npm run test:coverage

# Submission Service
cd SubmissionService
npm test

# Frontend
cd Frontend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in each service's README
- Review the TEST_README.md in ProblemService for testing guidelines
