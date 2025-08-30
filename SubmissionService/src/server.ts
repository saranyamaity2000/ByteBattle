import fastify, { FastifyError } from "fastify";
import { envConfig } from "./configs";
import fastifyMongo from "@fastify/mongodb";
import { v1Routes } from "./router/v1";
import { fastifyServerOptions } from "./configs/server.config";

export async function buildServer() {
	const app = fastify(fastifyServerOptions);

	// connect to MongoDB
	await app.register(fastifyMongo, {
		url: envConfig.MONGODB_URI,
	});
	app.log.info("✅ Connected to MongoDB");

	// basic routes registering
	await app.register(v1Routes, {
		prefix: "/api/v1",
	});

	// global error handler
	app.setErrorHandler(async (error: FastifyError, _request, reply) => {
		app.log.error(error);

		// Handle custom FastifyErrors with statusCode
		if (error.statusCode) {
			return reply.code(error.statusCode).send({
				error: error.name || "Error",
				message: error.message,
				code: error.code,
			});
		}

		// Default server error
		return reply.code(500).send({
			error: "Internal Server Error",
			message: "Something went WRONG",
		});
	});

	return app;
}
