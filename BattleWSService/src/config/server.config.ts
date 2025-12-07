import "dotenv/config";

export interface ServerConfig {
	PORT: number;
	NODE_ENV: string;
	REDIS_HOST: string;
	REDIS_PORT: number;
	REDIS_PASSWORD: string;
	REDIS_DB: number;
	SUPABASE_URL: string;
	SUPABASE_API_KEY: string;
	MONGO_URI: string;
	PROBLEM_SERVICE_URL: string;
	APP_NAME: string;
	ALLOWED_ORIGINS: string[];
	X_API_KEY: string;
}

export const serverConfig: ServerConfig = {
	PORT: +(process.env.PORT || "3101"),
	NODE_ENV: process.env.NODE_ENV || "local",
	APP_NAME: process.env.APP_NAME || "ByteBattle",
	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: +(process.env.REDIS_PORT || "6379"),
	REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
	REDIS_DB: +(process.env.REDIS_DB || "0"),
	SUPABASE_URL: process.env.SUPABASE_URL || "",
	SUPABASE_API_KEY: process.env.SUPABASE_API_KEY || "",
	MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/bytebattle",
	PROBLEM_SERVICE_URL: process.env.PROBLEM_SERVICE_URL || "http://localhost:3000",
	ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
		? process.env.ALLOWED_ORIGINS.split(",")
		: ["http://localhost:5173"],
	X_API_KEY: process.env.X_API_KEY ?? "default_internal_api_key",
};
