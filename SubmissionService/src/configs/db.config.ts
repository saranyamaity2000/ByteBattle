import mongoose from "mongoose";
import { envConfig } from ".";
import { FastifyInstance } from "fastify";

export const connectDB = async (app: FastifyInstance) => {
	try {
		const dbUrl = envConfig.MONGODB_URI;
		await mongoose.connect(dbUrl);

		app.log.info("Connected to mongodb successfully");

		mongoose.connection.on("error", (error) => {
			app.log.error("MongoDB connection error", error);
		});

		mongoose.connection.on("disconnected", () => {
			app.log.warn("MongoDB disconnected");
		});

		app.addHook("onClose", async () => {
			await mongoose.connection.close();
			app.log.info("MongoDB connection closed");
		});
	} catch (error) {
		app.log.error(`Failed to connect to mongodb: ${String(error)}`);
		process.exit(1); // Exit with failure
	}
};
