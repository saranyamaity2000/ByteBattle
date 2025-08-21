// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
	PORT: number;
	MONGO_URI: string;
	AWS: {
		ACCESS_KEY_ID: string;
		ACCESS_KEY_SECRET: string;
		REGION: string;
		BUCKET_NAME: string;
	};
};

function loadEnv() {
	dotenv.config();
	console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3001,
	MONGO_URI: process.env.MONGO_URI || "N/A",
	AWS: {
		ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "N/A",
		ACCESS_KEY_SECRET: process.env.AWS_ACCESS_KEY_SECRET || "N/A",
		REGION: process.env.AWS_REGION || "N/A",
		BUCKET_NAME: process.env.AWS_BUCKET_NAME || "N/A",
	},
};
