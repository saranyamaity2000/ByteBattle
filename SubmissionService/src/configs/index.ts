import { config } from "dotenv";

// Load environment variables
config();

export interface EnvConfig {
	PORT: number;
	MONGODB_URI: string;
	LOG_LEVEL: string;
	RABBITMQ_URL: string;
	RABBITMQ_UI_URL: string;
	SUPABASE_URL: string;
	SUPABASE_API_KEY: string;
	PROBLEM_SERVICE_URL: string;
}

export const envConfig: EnvConfig = {
	PORT: parseInt(process.env.PORT || "3000", 10),
	MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/submission-service",
	LOG_LEVEL: process.env.LOG_LEVEL || "info",
	RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost:5672",
	RABBITMQ_UI_URL: process.env.RABBITMQ_UI_URL || "http://localhost:15672",
	SUPABASE_URL: process.env.SUPABASE_URL || "",
	SUPABASE_API_KEY: process.env.SUPABASE_API_KEY || "",
	PROBLEM_SERVICE_URL: process.env.PROBLEM_SERVICE_URL || "http://localhost:3001",
};

export const constantConfig = {
	SUBMISSION_QUEUE: "submission_queue",
} as const;
