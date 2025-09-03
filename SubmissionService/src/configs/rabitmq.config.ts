import { FastifyInstance } from "fastify";
import { envConfig } from ".";
import amqp from "amqplib";
import { MessagingQueueChannelPool } from "../pool-management/mq.channel.pool";

export async function connectToRabbitMQ(app: FastifyInstance): Promise<MessagingQueueChannelPool> {
	try {
		const connection = await amqp.connect(envConfig.RABBITMQ_URL);
		app.log.info("Connected to RabbitMQ successfully: " + envConfig.RABBITMQ_URL);
		app.log.info("RabbitMQ Management UI available at: " + envConfig.RABBITMQ_UI_URL);
		connection.on("error", (error) => {
			app.log.error("RabbitMQ connection error", error);
		});
		connection.on("close", () => {
			app.log.warn("RabbitMQ connection closed");
		});
		const channelPool = new MessagingQueueChannelPool(connection);
		await channelPool.open();
		app.log.info(
			"RabbitMQ channel pool created successfully with pool size " + channelPool.getPoolSize()
		);
		app.addHook("onClose", async () => {
			await channelPool.close();
			await connection.close();
		});
		return channelPool;
	} catch (error) {
		throw new Error(`Failed to connect to RabbitMQ: ${String(error)}`);
	}
}
