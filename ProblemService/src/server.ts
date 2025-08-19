import mongoose from "mongoose";
import { serverConfig } from "./config";
import logger from "./config/logger.config";
import app from "./app";

// MongoDB Connection and Server Start
(async () => {
	const mongoUri = process.env.MONGO_URI || "";
	try {
		await mongoose.connect(mongoUri);
		logger.info("MongoDB connected");
		app.listen(serverConfig.PORT, () => {
			logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
			logger.info(`Press Ctrl+C to stop the server.`);
		});
	} catch (err) {
		logger.error("MongoDB connection error:", err);
		process.exit(1);
	}
})();
