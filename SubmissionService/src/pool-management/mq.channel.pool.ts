import { ChannelModel, Channel } from "amqplib";

export class MessagingQueueChannelPool {
	private connection: ChannelModel;
	private channels: Channel[];
	private poolSize: number;
	private currChannelIdx: number;
	private readonly minPoolSize = 5; // eventually should be dynamic
	private readonly maxPoolSize = 1000;

	constructor(connection: ChannelModel, poolSize: number = 5) {
		this.connection = connection;
		this.channels = [];
		this.poolSize = Math.min(Math.max(poolSize, this.minPoolSize), this.maxPoolSize);
		this.currChannelIdx = 0;
	}

	async open(): Promise<void> {
		try {
			for (let i = 0; i < this.poolSize; i++) {
				const channel = await this.connection.createChannel();
				this.channels.push(channel);
			}
		} catch (error) {
			throw new Error(`Failed to initialize channel pool: ${String(error)}`);
		}
	}

	getAvailableChannel(): Channel {
		if (this.channels.length === 0) {
			throw new Error("No channels available in the pool.");
		}
		// Round-robin selection
		const channel = this.channels[this.currChannelIdx];
		this.currChannelIdx = (this.currChannelIdx + 1) % this.poolSize;
		if (!channel) {
			throw new Error("No channels available in the pool.");
		}
		return channel;
	}

	async close(): Promise<void> {
		for (const channel of this.channels) {
			try {
				await channel.close();
			} catch (error) {
				// Log error but continue closing other channels
				console.error("Error closing channel:", error);
			}
		}
		this.channels = [];
	}

	getPoolSize(): number {
		return this.poolSize;
	}
}
