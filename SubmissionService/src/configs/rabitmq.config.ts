import { FastifyInstance } from "fastify";
import { envConfig } from ".";
import amqp, { Channel } from "amqplib";

export async function connectToRabbitMQ(app: FastifyInstance): Promise<Channel> {
	try {
		const connection = await amqp.connect(envConfig.RABBITMQ_URL);
		app.log.info("Connected to RabbitMQ successfully: " + envConfig.RABBITMQ_URL);
		connection.on("error", (error) => {
			app.log.error("RabbitMQ connection error", error);
		});
		connection.on("close", () => {
			app.log.warn("RabbitMQ connection closed");
		});
		const channel = await connection.createChannel();
		app.addHook("onClose", async () => {
			await channel.close();
			await connection.close();
		});
		return channel;
	} catch (error) {
		throw new Error(`Failed to connect to RabbitMQ: ${String(error)}`);
	}
}
