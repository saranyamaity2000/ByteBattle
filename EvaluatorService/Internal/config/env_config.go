package config

import utility_env "maitysaranya.com/EvaluatorService/Internal/utility/env"

func init() {
	LoadEnvConfig()
}

type ConfigType struct {
	RabbitMQURL string
	PoolSize    int
	QueueName   string
}

var AppConfig ConfigType

func LoadEnvConfig() {
	AppConfig = ConfigType{
		RabbitMQURL: utility_env.GetString("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		PoolSize:    utility_env.GetInt("POOL_SIZE", 2),
		QueueName:   utility_env.GetString("QUEUE_NAME", "submission_queue"),
	}
}
