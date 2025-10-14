import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SubmissionController } from "../../controllers/submission.controller";
import {
	createSubmissionSchema,
	updateSubmissionSchema,
	submissionParamsSchema,
} from "../../schemas/submission.validation-schema";
import { verifySupabaseToken } from "../../utils/auth.middleware";
import {
	CreateSubmissionRequestDTO,
	UpdateSubmissionStatusRequestDTO,
} from "../../dtos/submission.dto";

interface SubmissionRoutes {
	submissionController: SubmissionController;
}

interface GetSubmissionParams {
	id: string;
}

export async function submissionRoutes(fastify: FastifyInstance, options: SubmissionRoutes) {
	const { submissionController } = options;

	// Create a new submission (requires authentication)
	fastify.post<{
		Body: CreateSubmissionRequestDTO;
	}>(
		"/",
		{
			preHandler: verifySupabaseToken,
			schema: {
				body: createSubmissionSchema,
			},
		},
		async (
			request: FastifyRequest<{ Body: CreateSubmissionRequestDTO }>,
			reply: FastifyReply
		) => {
			return submissionController.createSubmission(request, reply);
		}
	);

	// Update a specific submission status and result (requires authentication)
	fastify.patch<{
		Params: GetSubmissionParams;
		Body: UpdateSubmissionStatusRequestDTO;
	}>(
		"/:id",
		{
			preHandler: verifySupabaseToken,
			schema: {
				params: submissionParamsSchema,
				body: updateSubmissionSchema,
			},
		},
		async (
			request: FastifyRequest<{
				Params: GetSubmissionParams;
				Body: UpdateSubmissionStatusRequestDTO;
			}>,
			reply: FastifyReply
		) => {
			return submissionController.updateSubmissionStatus(request, reply);
		}
	);

	// Get a specific submission (requires authentication)
	fastify.get<{
		Params: GetSubmissionParams;
	}>(
		"/:id",
		{
			preHandler: verifySupabaseToken,
			schema: {
				params: submissionParamsSchema,
			},
		},
		async (request: FastifyRequest<{ Params: GetSubmissionParams }>, reply: FastifyReply) => {
			return submissionController.getSubmission(request, reply);
		}
	);
}
