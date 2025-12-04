import { MessagingQueueService } from "./../../services/mq.service";
import { FastifyInstance } from "fastify";
import { submissionRoutes } from "./submissions.router";
import { SubmissionController } from "../../controllers/submission.controller";
import { SubmissionService } from "../../services/submission.service";
import { SubmissionRepository } from "../../repositories/submission.repository";
import SubmissionPublisherService from "../../services/submission.publisher.service";
import { connectToRabbitMQ } from "../../configs/rabitmq.config";
import { ProblemClient } from "../../clients/problem.client";
import { envConfig } from "../../configs";
import { ChallengeClient } from "../../clients/challenge.client";

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
			new SubmissionService(
				fastify.log,
				new SubmissionRepository(),
				new SubmissionPublisherService(
					fastify.log,
					new MessagingQueueService(await connectToRabbitMQ(fastify))
				),
				new ProblemClient(fastify.log, envConfig.PROBLEM_SERVICE_URL),
                new ChallengeClient(fastify.log, envConfig.CHALLENGE_SERVICE_URL)
			)
		),
	});
}
