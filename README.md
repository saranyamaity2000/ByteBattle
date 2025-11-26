# ByteBattle

ByteBattle is a comprehensive coding platform that allows users to solve programming problems with real-time code evaluation and engage in head-to-head coding battles. The platform consists of a frontend client and four microservices working together to provide a seamless coding experience.

## Architecture Overview

The project follows a microservices architecture with the following components:

```
┌─────────────────┐
│    Frontend     │  ← User Interface (React + Vite + Socket.IO)
│   (Port 5173)   │
└────────┬────────┘
         │
         ├────────────────────┬─────────────────────┐
         │                    │                     │
         ▼                    ▼                     ▼
┌────────────────┐  ┌─────────────────┐  ┌────────────────────┐
│ Problem Service│  │Submission Service│  │ BattleWS Service   │
│  (Port 3001)   │  │   (Port 3000)    │  │   (Port 3101)      │
│   MongoDB      │  │    MongoDB       │  │   MongoDB + Redis  │
└────────────────┘  └──────┬──────────┘  │   Socket.IO        │
                           │             └────────────────────┘
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
- **Authentication**: Supabase Auth
- **Real-time**: Socket.IO Client (for battles)

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

### 4. BattleWS Service
WebSocket service for real-time coding battles:
- **Stack**: Node.js + Express + TypeScript + Socket.IO
- **Database**: MongoDB
- **Cache**: Redis (for Socket.IO adapter)
- **Authentication**: Supabase Auth
- **Port**: 3101

### 5. Evaluator Service
Worker service that evaluates code submissions:
- **Language**: Go
- **Execution**: Docker containers (sandboxed)
- **Message Queue**: RabbitMQ (consumer)

## Quick Start

### Prerequisites

- **Node.js** 22.x or higher
- **Go** 1.24 or higher
- **MongoDB** 4.4 or higher
- **Redis** 6.x or higher (for BattleWS Service)
- **Docker** and Docker Desktop (for RabbitMQ and code execution)
- **Supabase Account** (for authentication)
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

3. **Start Redis** (for BattleWS Service)
   ```bash
   # Using Docker
   docker run -d --name bytebattle-redis -p 6379:6379 redis:7-alpine
   
   # Or install Redis locally
   # macOS: brew install redis && brew services start redis
   # Ubuntu: sudo apt install redis-server && sudo systemctl start redis
   ```

4. **Setup and Start Problem Service**
   ```bash
   cd ProblemService
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

5. **Setup and Start Submission Service**
   ```bash
   cd SubmissionService
   npm install
   # Configure .env file with MongoDB and RabbitMQ URLs
   npm run dev
   ```

6. **Setup and Start BattleWS Service**
   ```bash
   cd BattleWSService
   pnpm install
   # Create .env file with MongoDB, Redis, and Supabase credentials
   pnpm run dev
   ```

7. **Setup and Start Evaluator Service**
   ```bash
   cd EvaluatorService
   go mod download
   # Create .env file with RABBITMQ_URL and QUEUE_NAME
   go run cmd/main.go
   ```

8. **Setup and Start Frontend**
   ```bash
   cd Frontend
   npm install
   cp .env.example .env.development  # Configure API endpoints and Supabase
   npm run dev
   ```

9. **Access the application**
   - Frontend: http://localhost:5173
   - Problem Service: http://localhost:3001
   - Submission Service: http://localhost:3000
   - BattleWS Service: ws://localhost:3101
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

## Detailed Setup Guides

For detailed setup instructions for each component, please refer to:

- [Frontend Setup Guide](./Frontend/README.md)
- [Problem Service Setup Guide](./ProblemService/README.md)
- [Submission Service Setup Guide](./SubmissionService/README.md)
- [Evaluator Service Setup Guide](./EvaluatorService/README.md)
- BattleWS Service - Follow setup in step 6 above (no separate README yet)

## Development Workflow

### Standard Problem Solving Flow
1. **Create a Problem** - Use Problem Service API to create coding problems with test cases
2. **Upload Test Cases** - Upload test case files via Problem Service
3. **Solve Problems** - Users write code in the Frontend editor
4. **Submit Code** - Frontend sends code to Submission Service
5. **Queue Submission** - Submission Service queues the submission to RabbitMQ
6. **Evaluate** - Evaluator Service picks up submissions, runs code in Docker, and returns results
7. **View Results** - Frontend displays evaluation results to the user

### Real-time Battle Flow
1. **Challenge Creation** - User initiates a challenge to another user via email
2. **Real-time Notification** - BattleWS Service sends challenge notification via Socket.IO
3. **Accept Challenge** - Opponent accepts/declines the challenge in real-time
4. **Problem Selection** - System selects a random problem based on difficulty
5. **Battle Start** - Both users get the same problem and compete in real-time
6. **Time-limited Competition** - Users solve the problem within the time limit
7. **Winner Declaration** - First to solve correctly or best solution wins

## Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Monaco Editor, Socket.IO Client, Supabase Auth |
| **Problem Service** | Node.js, Express, TypeScript, MongoDB, AWS S3 |
| **Submission Service** | Node.js, Fastify, TypeScript, MongoDB, RabbitMQ |
| **BattleWS Service** | Node.js, Express, TypeScript, Socket.IO, MongoDB, Redis, Supabase Auth |
| **Evaluator Service** | Go, Docker, RabbitMQ |
| **Infrastructure** | Docker, MongoDB, RabbitMQ, Redis, Supabase |

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

### BattleWS Service (Port 3101)
Real-time WebSocket connections via Socket.IO:
- `challenge` - Send challenge to another user
- `challenge-reply` - Accept/decline a challenge
- `match_start` - Battle begins notification
- `match_error` - Error during battle setup

## Environment Variables

### Frontend
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_API_TIMEOUT=10000
VITE_SUBMISSION_SERVICE_URL=http://localhost:3000/api/v1
VITE_BATTLE_SOCKET_URL=http://localhost:3101
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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

### BattleWS Service
```env
PORT=3101
NODE_ENV=local
APP_NAME=ByteBattle
MONGO_URI=mongodb://localhost:27017/bytebattle
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
SUPABASE_URL=your_supabase_project_url
SUPABASE_API_KEY=your_supabase_service_role_key
PROBLEM_SERVICE_URL=http://localhost:3001
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
