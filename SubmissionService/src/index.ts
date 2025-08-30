import { envConfig } from "./configs/index";
import { buildServer } from "./server";

(async function startServer() {
	let app: any = null;

	try {
		app = await buildServer();

		await app.listen({
			port: envConfig.PORT,
			host: "0.0.0.0",
		});

		app.log.info(`🚀 Submission service is running on port ${envConfig.PORT}`);
		app.log.info(`📊 MongoDB: ${envConfig.MONGODB_URI}`);

		// Graceful shutdown handlers
		const shutdown = async (signal: string) => {
			console.log(`\n${signal} received. Shutting down gracefully...`);
			if (app) {
				try {
					await app.close();
					console.log("Server closed successfully");
					process.exit(0);
				} catch (error) {
					console.error("Error during shutdown:", error);
					process.exit(1);
				}
			}
		};
		process.on("SIGTERM", () => shutdown("SIGTERM"));
		process.on("SIGINT", () => shutdown("SIGINT"));
	} catch (error) {
		console.error("Error starting app:", error);
		if (app) {
			try {
				await app.close();
			} catch (closeError) {
				console.error("Error closing app:", closeError);
			}
		}
		process.exit(1);
	}
})();
