import fastify, { FastifyError } from "fastify";
import { v1Routes } from "./router/v1";
import { fastifyServerOptions } from "./configs/server.config";
import { connectDB } from "./configs/db.config";

export async function buildServer() {
	const app = fastify({
		...fastifyServerOptions,
		ajv: {
			customOptions: {
				coerceTypes: false, // Disable type coercion
				removeAdditional: false, // Don't remove additional properties
				useDefaults: true, // Still use default values
				allErrors: true, // Report all validation errors
			},
		},
	});

	// database connection
	await connectDB(app);

	// basic routes registering
	app.register(v1Routes, {
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

	await app.ready();
	return app;
}
