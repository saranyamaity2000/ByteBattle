import type { Redis } from "ioredis";
import { redisClient } from "../clients/redis.client.js";
import type { BasicChallengeInfo } from "../types/challenge.type.js";

class SocketService {
	constructor(private readonly rc: Redis) {}
	async storeSocketId(email: string, socketId: string): Promise<void> {
		await this.rc.set(`email:${email}`, socketId);
	}
	async getSocketId(email: string): Promise<string | null> {
		return this.rc.get(`email:${email}`);
	}
	async deleteSocketId(email: string): Promise<void> {
		await this.rc.del(`email:${email}`);
	}
}

const socketService = new SocketService(redisClient.client);
export default socketService;
