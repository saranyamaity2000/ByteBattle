import "dotenv/config";

export interface ServerConfig {
	PORT: number;
	NODE_ENV: string;
}
export const serverConfig: ServerConfig = {
	PORT: parseInt(process.env.PORT || "3101", 10),
	NODE_ENV: process.env.NODE_ENV || "development",
};
