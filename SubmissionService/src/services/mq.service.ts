import { MessagingQueueChannelPool } from "../pool-management/mq.channel.pool";

export class MessagingQueueService {
	constructor(private readonly channelPool: MessagingQueueChannelPool) {}

	async sendMessage(queue: string, message: Buffer): Promise<void> {
		const channel = this.channelPool.getAvailableChannel();
		await channel.assertQueue(queue);
		channel.sendToQueue(queue, message, { persistent: true });
	}
}
