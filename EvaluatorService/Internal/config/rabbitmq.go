package config

import (
	"fmt"

	rabbitmq "github.com/rabbitmq/amqp091-go"
)

func GetRabbitMQConnection() (*rabbitmq.Connection, error) {
	conn, err := rabbitmq.Dial(AppConfig.RabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}
	return conn, nil
}
