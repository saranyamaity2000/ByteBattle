import { FastifyInstance } from "fastify";
import { SubmissionController } from "../../controllers/submission.controller";
import {
	createSubmissionSchema,
	updateSubmissionSchema,
	submissionParamsSchema,
} from "../../schemas/submission.validation-schema";

interface SubmissionRoutes {
	submissionController: SubmissionController;
}

export async function submissionRoutes(fastify: FastifyInstance, options: SubmissionRoutes) {
	const { submissionController } = options;

	// Create a new submission
	fastify.post(
		"/",
		{
			schema: {
				body: createSubmissionSchema,
			},
		},
		submissionController.createSubmission
	);

	// Update a specific submission status and result
	fastify.patch(
		"/:id",
		{
			schema: {
				params: submissionParamsSchema,
				body: updateSubmissionSchema,
			},
		},
		submissionController.updateSubmissionStatus
	);

	// Get a specific submission
	fastify.get(
		"/:id",
		{
			schema: {
				params: submissionParamsSchema,
			},
		},
		submissionController.getSubmission
	);
}
