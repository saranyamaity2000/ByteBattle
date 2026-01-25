# Stage 1: Build the Go application
FROM golang:1.24-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum to download dependencies first
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application for a linux environment
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/evaluator-service ./cmd/main.go

# Stage 2: Create the final small image
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/evaluator-service .

# Command to run the application
CMD ["./evaluator-service"]
