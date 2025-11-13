import { Redis, type Callback } from "ioredis";
import { serverConfig } from "../config/server.config.js";

export const subscriberRedisClient = new Redis({
	host: serverConfig.REDIS_HOST,
	port: serverConfig.REDIS_PORT,
	password: serverConfig.REDIS_PASSWORD,
	db: serverConfig.REDIS_DB,
});

class RedisService {
	private _publisher: Redis;
	private _subscriber: Redis;
	constructor() {
		const redisConfig = {
			host: serverConfig.REDIS_HOST,
			port: serverConfig.REDIS_PORT,
			password: serverConfig.REDIS_PASSWORD,
			db: serverConfig.REDIS_DB,
		};
		this._publisher = new Redis(redisConfig);
		this._subscriber = new Redis(redisConfig);
	}
	get publisher() {
		return this._publisher;
	}
	get subscriber() {
		return this._subscriber;
	}
}
export const redisService = new RedisService();
