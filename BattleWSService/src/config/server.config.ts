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
}
export const serverConfig: ServerConfig = {
	PORT: +(process.env.PORT || "3101"),
	NODE_ENV: process.env.NODE_ENV || "development",
	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: +(process.env.REDIS_PORT || "6379"),
	REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
	REDIS_DB: +(process.env.REDIS_DB || "0"),
	SUPABASE_URL: process.env.SUPABASE_URL || "",
	SUPABASE_API_KEY: process.env.SUPABASE_API_KEY || "",
};
