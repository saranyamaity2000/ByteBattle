import fastify, { FastifyError } from "fastify";
import { v1Routes } from "./router/v1";
import { fastifyServerOptions } from "./configs/server.config";
import { connectDB } from "./configs/db.config";
import { envConfig } from "./configs";
import { initializeSupabase } from "./utils/auth.middleware";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";

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

	// Initialize Supabase for authentication
	try {
		initializeSupabase(envConfig.SUPABASE_URL, envConfig.SUPABASE_API_KEY);
	} catch (err) {
		console.error("Failed to initialize Supabase authentication:", err);
		throw new Error("Server startup aborted due to Supabase authentication setup failure.");
	}

	// database connection
	await connectDB(app);

	// CORS setup to allow all origins
	await app.register(fastifyCors, {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	});

	// Rate limiting (limit each IP to 60 requests per minute)
	await app.register(fastifyRateLimit, {
		max: 60,
		timeWindow: "1 minute",
	});

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
				message: error.message,
				code: error.code,
			});
		}

		// Default server error
		return reply.code(500).send({
			code: "INTERNAL_SERVER_ERROR",
			message: "Internal Server Error | Something went WRONG",
		});
	});

	await app.ready();
	return app;
}
