# Problem Service Testing Guide

This guide explains how to run the comprehensive test suite for the Problem Service.

## Test Setup

The test suite includes:

-   **Integration tests** that test the full HTTP request/response cycle
-   **Edge case tests** for boundary conditions and error scenarios
-   **MongoDB integration** using both in-memory and Docker containers

## Running Tests

### 1. Quick Tests (In-Memory MongoDB)

```bash
npm test
```

This uses MongoDB Memory Server for fast, isolated tests.

### 2. Real MongoDB Tests (Docker)

```bash
# Start MongoDB test container
npm run docker:test:up

# Run tests against Docker MongoDB
npm run test:docker

# Stop test container
npm run docker:test:down
```

### 3. Watch Mode

```bash
npm run test:watch
```

### 4. Coverage Report

```bash
npm run test:coverage
```

## Test Structure

### Main Test File: `problem.controller.test.ts`

-   **POST /api/v1/problems** - Create problem tests
-   **GET /api/v1/problems** - Get all problems tests
-   **GET /api/v1/problems/:slug** - Get single problem tests
-   **PUT /api/v1/problems/:slug** - Update problem tests
-   **DELETE /api/v1/problems/:slug** - Delete problem tests
-   **Data Integrity** - Slug generation, defaults, constraints
-   **Error Handling** - Validation and error scenarios

### Edge Cases: `problem.controller.edge-cases.test.ts`

-   **Validation Edge Cases** - Empty data, invalid formats
-   **Large Data Handling** - Many examples/testcases, long content
-   **Boundary Value Testing** - Min/max limits
-   **Unicode/Internationalization** - Special characters, RTL text
-   **Concurrency** - Race conditions, concurrent operations

## Test Data

Each test uses realistic problem data including:

-   Title, slug, statement, difficulty
-   Examples with input/output/explanation
-   Testcases with S3 URLs
-   Constraints, time/memory limits
-   Author, tags, publication status

## Database Cleanup

Tests automatically clean up after each test case to ensure isolation.

## Environment Variables

For Docker tests:

-   `USE_DOCKER_MONGO=true` - Use Docker MongoDB instead of memory server
-   `MONGO_TEST_URI` - Custom MongoDB connection string

## CI/CD Integration

The test suite is designed to work in CI/CD environments:

```bash
# In CI pipeline
npm run docker:test:up
npm run test:docker
npm run docker:test:down
```

## Debugging Tests

To debug failing tests:

1. Run specific test: `npm test -- --testNamePattern="should create a new problem"`
2. Use verbose output: `npm test -- --verbose`
3. Check logs in the test output for detailed error messages

## Performance Considerations

-   In-memory tests are faster but don't test real MongoDB behavior
-   Docker tests are slower but more realistic
-   Use in-memory for development, Docker for CI/CD
