# Problem Service Testing Guide

This guide explains how to run the comprehensive test suite for the Problem Service.

## Test Setup

The test suite includes:

- **Integration tests** that test the full HTTP request/response cycle
- **Edge case tests** for boundary conditions and error scenarios
- **MongoDB integration** using both in-memory and Docker containers

## Running Tests

### 1. Quick Tests (In-Memory MongoDB)

```bash
npm test
```

This uses MongoDB Memory Server for fast, isolated tests.

### 2. Coverage Report

```bash
npm run test:coverage
```

## Test Structure

### Main Test File: `problem.controller.test.ts`

- **POST /api/v1/problems** - Create problem tests
- **GET /api/v1/problems** - Get all problems tests
- **GET /api/v1/problems/:slug** - Get single problem tests
- **PUT /api/v1/problems/:slug** - Update problem tests
- **DELETE /api/v1/problems/:slug** - Delete problem tests
- **Data Integrity** - Slug generation, defaults, constraints
- **Error Handling** - Validation and error scenarios

### Edge Cases: `problem.controller.edge-cases.test.ts`

- **Validation Edge Cases** - Empty data, invalid formats
- **Large Data Handling** - Many examples/testcases, long content
- **Boundary Value Testing** - Min/max limits
- **Unicode/Internationalization** - Special characters, RTL text
- **Concurrency** - Race conditions, concurrent operations
