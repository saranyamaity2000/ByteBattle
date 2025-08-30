import { FastifyServerOptions } from "fastify";
import { envConfig } from ".";

export const fastifyServerOptions: FastifyServerOptions = {
	logger: {
		level: envConfig.LOG_LEVEL,
		base: {}, // This removes pid and hostname from the base fields
		timestamp: () => `,"time":"${new Date().toISOString()}"`,
		formatters: {
			level: (label: string) => {
				return { level: label };
			},
		},
		serializers: {
			req: (request: any) => {
				return {
					method: request.method,
					url: request.url,
				};
			},
			res: (reply: any) => {
				return {
					statusCode: reply.statusCode,
				};
			},
		},
	},
};
