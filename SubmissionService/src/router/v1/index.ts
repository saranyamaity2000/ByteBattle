import { FastifyInstance } from "fastify";
import { submissionRoutes } from "./submissions.router";
import { SubmissionController } from "../../controllers/submission.controller";
import { SubmissionService } from "../../services/submission.service";
import { SubmissionRepository } from "../../repositories/submission.repository";

export async function v1Routes(fastify: FastifyInstance) {
	fastify.get("/api/v1/health", async (_request, reply) => {
		return reply.send({
			status: "OK",
			timestamp: new Date().toISOString(),
			service: "submission-service",
		});
	});
	fastify.register(submissionRoutes, {
		prefix: "/submissions",
		submissionController: new SubmissionController(
			new SubmissionService(fastify, new SubmissionRepository())
		),
	});
}
