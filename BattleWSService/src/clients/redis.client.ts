import { Redis, type Callback, type RedisOptions } from "ioredis";
import { serverConfig } from "../config/server.config.js";
import { Utils } from "../utilities/util.js";

class RedisClient {
	private _publisher: Redis;
	private _subscriber: Redis;
	constructor() {
		const redisConfig: RedisOptions = {
			host: serverConfig.REDIS_HOST,
			port: serverConfig.REDIS_PORT,
			password: serverConfig.REDIS_PASSWORD,
			db: serverConfig.REDIS_DB,
		};
		this._publisher = new Redis(redisConfig);
		this._subscriber = new Redis(redisConfig);

		// Add error handlers to prevent unhandled error warnings
		this._publisher.on("error", (err) => {
			console.error("Redis Publisher Error:", err);
		});

		this._subscriber.on("error", (err) => {
			console.error("Redis Subscriber Error:", err);
		});

		// Optional: Add connection event handlers for better debugging
		this._publisher.on("connect", () => {
			console.log("Redis Publisher connected");
		});

		this._subscriber.on("connect", () => {
			console.log("Redis Subscriber connected");
		});
	}
	get publisher() {
		return this._publisher;
	}
	get subscriber() {
		return this._subscriber;
	}

	async getUniqueBase62Id(): Promise<string> {
		const uniqueId = await this.publisher.incr("uniqueId:number");
		return Utils.getBase62String(uniqueId);
	}
}
export const redisService = new RedisClient();
