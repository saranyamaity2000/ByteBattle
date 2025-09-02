import { FastifyBaseLogger } from "fastify";
import { Channel } from "amqplib";
import { SubmissionQueueMessageDTO } from "../dtos/submission.dto";

export interface SubmissionPublisherService {
	publishMessage(queue: string, message: SubmissionQueueMessageDTO): Promise<void>;
}

class RabbitMQPublisherService implements SubmissionPublisherService {
	constructor(private readonly logger: FastifyBaseLogger, private readonly channel: Channel) {}

	async publishMessage(queue: string, message: SubmissionQueueMessageDTO): Promise<void> {
		// ensure the queue exists and if not creates the queue with persistent messages
		await this.channel.assertQueue(queue, { durable: true });

		const messageBuffer = Buffer.from(JSON.stringify(message));
		this.channel.sendToQueue(queue, messageBuffer, { persistent: true });

		this.logger.info(`Message sent to ${queue}: ${JSON.stringify(message)}`);
	}
}

export default RabbitMQPublisherService;
