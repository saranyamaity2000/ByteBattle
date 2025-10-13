# Problem Service - ByteBattle

RESTful API service for managing coding problems, test cases, and problem metadata. Built with Express, TypeScript, and MongoDB, with AWS S3 integration for test case storage.

## Features

- 📝 CRUD operations for coding problems
- 📦 Test case file upload/download via AWS S3
- 🔍 Problem search and filtering
- 🏷️ Support for tags, categories, and difficulty levels
- 📊 Problem statistics tracking
- ✅ Comprehensive test coverage with Jest

## Tech Stack

- **Runtime**: Node.js 22.x+
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Storage**: AWS S3
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Validation**: Zod

## Prerequisites

- Node.js 22.0.0 or higher
- MongoDB 4.4 or higher
- AWS Account (for S3 bucket)
- npm or yarn package manager

## Local Setup

### 1. Install Dependencies

```bash
cd ProblemService
npm install
```

### 2. Environment Configuration

Create a `.env` file in the ProblemService directory:

```env
# Server Configuration
PORT=3001

# Database
MONGO_URI=mongodb://localhost:27017/problem-service

# AWS S3 Configuration (for test case storage)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_ACCESS_KEY_SECRET=your_secret_access_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Note**: For local development, you can use MongoDB locally or MongoDB Atlas. For S3, you can use LocalStack or MinIO as alternatives.

### 3. Start MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB (if not already installed)
# macOS
brew install mongodb-community

# Start MongoDB
mongod --dbpath /path/to/data/directory
```

#### Option B: MongoDB Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: MongoDB Atlas
Use the connection string from MongoDB Atlas in your `.env` file.

### 4. Start the Server

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm run start
```

The service will be available at: **http://localhost:3001**

## Available Scripts

- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm run start` - Build and start production server
- `npm test` - Run test suite with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## API Endpoints

### Problem Management

#### Get All Problems
```http
GET /api/v1/problems
```
Returns list of all published problems.

#### Get Problem by Slug
```http
GET /api/v1/problems/:slug
```
Returns detailed problem information including examples and constraints.

#### Create Problem
```http
POST /api/v1/problems
Content-Type: application/json

{
  "title": "Two Sum",
  "statement": "Given an array of integers...",
  "difficulty": "easy",
  "examples": [
    {
      "input": "[2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
    }
  ],
  "constraints": ["1 <= nums.length <= 10^4"],
  "timeLimitMs": 2000,
  "memoryLimitKb": 256000
}
```

#### Update Problem
```http
PUT /api/v1/problems/:slug
Content-Type: application/json

{
  "title": "Updated Title",
  "difficulty": "medium"
}
```

#### Delete Problem
```http
DELETE /api/v1/problems/:slug
```

#### Publish Problem
```http
POST /api/v1/problems/:slug/publish
```

### Test Case Management

#### Upload Test Cases
```http
POST /api/v1/problems/:slug/testcases
Content-Type: multipart/form-data

testcase: [file]
```
Upload a test case file (ZIP or JSON) to S3.

#### Download Test Cases
```http
GET /api/v1/problems/:slug/testcases
```
Download the test case file from S3.

## Project Structure

```
ProblemService/
├── src/
│   ├── config/
│   │   ├── index.ts           # Environment configuration
│   │   └── logger.config.ts   # Winston logger setup
│   ├── controllers/
│   │   └── problem.controller.ts
│   ├── models/
│   │   └── problem.model.ts   # Mongoose schema
│   ├── routes/
│   │   └── problem.routes.ts
│   ├── services/
│   │   ├── problem.service.ts
│   │   └── s3.service.ts      # AWS S3 operations
│   ├── middleware/
│   │   └── error.middleware.ts
│   ├── utils/
│   │   └── validators.ts      # Zod schemas
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── tests/
│   ├── problem.controller.test.ts
│   └── problem.controller.edge-cases.test.ts
├── .env.example
├── jest.config.js
├── tsconfig.json
└── package.json
```

## Data Models

### Problem Schema

```typescript
{
  title: string;              // Problem title
  slug: string;               // URL-friendly identifier (auto-generated)
  statement: string;          // Problem description (Markdown)
  difficulty: "easy" | "medium" | "hard";
  examples: [{
    input: string;
    output: string;
    explanation?: string;
  }];
  constraints: string[];      // Problem constraints
  timeLimitMs: number;        // Execution time limit (default: 2000)
  memoryLimitKb: number;      // Memory limit (default: 256000)
  author: string;             // Problem author
  isPublished: boolean;       // Visibility status
  isPremium: boolean;         // Premium problem flag
  submissionsCount: number;   // Submission count
  likes: number;              // Like count
  editorial: string;          // Editorial content (Markdown)
  topicTags: string[];        // Tags (arrays, strings, etc.)
  companyTags: string[];      // Company tags (Google, Amazon, etc.)
  testcaseUrl: string;        // S3 URL for test cases
  createdAt: Date;
  updatedAt: Date;
}
```

## Testing

The service includes comprehensive test coverage:

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Test Suites
- **Integration Tests**: Full API endpoint testing
- **Edge Case Tests**: Boundary conditions and error scenarios
- **MongoDB Integration**: In-memory MongoDB server for isolated testing

See [TEST_README.md](./TEST_README.md) for detailed testing documentation.

## AWS S3 Configuration

### Setting Up S3 Bucket

1. Create an S3 bucket in AWS Console
2. Configure bucket permissions for read/write
3. Create IAM user with S3 access
4. Add credentials to `.env` file

### Test Case File Format

Test cases should be uploaded as:
- **JSON**: Structured test case data
- **ZIP**: Compressed test case files

Example JSON format:
```json
{
  "testcases": [
    {
      "input": "5\n",
      "output": "120\n"
    }
  ]
}
```

## Error Handling

The service uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Logging

Winston logger is configured for structured logging:

```typescript
logger.info("Problem created", { slug: "two-sum" });
logger.error("Database error", { error: err });
```

Logs are written to:
- Console (development)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

## Development Tips

### Adding New Endpoints

1. Define Zod validation schema in `utils/validators.ts`
2. Add controller method in `controllers/problem.controller.ts`
3. Add route in `routes/problem.routes.ts`
4. Write tests in `tests/`

### Database Queries

Use Mongoose for database operations:

```typescript
const problem = await Problem.findOne({ slug });
const problems = await Problem.find({ difficulty: "easy" });
```

### Markdown Support

Problem statements and editorials support Markdown:
- Use `marked` library for rendering
- Sanitize HTML with `sanitize-html`
- Convert HTML back to Markdown with `turndown`

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Verify connection string
echo $MONGO_URI
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in .env file
```

### AWS S3 Errors
- Verify AWS credentials are correct
- Check bucket permissions and CORS configuration
- Ensure bucket region matches `AWS_REGION`

### Test Failures
```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test -- problem.controller.test.ts
```

## Performance Considerations

- Use MongoDB indexes for frequently queried fields (slug, difficulty)
- Implement pagination for problem lists
- Cache frequently accessed problems (Redis)
- Use S3 signed URLs for secure test case access

## Security Best Practices

- Validate all input with Zod schemas
- Sanitize Markdown content
- Use environment variables for secrets
- Implement rate limiting (future)
- Add authentication/authorization (future)

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Run `npm test` before committing
5. Follow conventional commit messages

## License

ISC License