FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /api-gateway ./cmd/api-gateway

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /api-gateway ./api-gateway
COPY config.yaml ./config.yaml

EXPOSE 8080

CMD ["./api-gateway"]
