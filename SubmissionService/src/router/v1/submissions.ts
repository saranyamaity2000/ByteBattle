import { FastifyInstance } from "fastify";
import { SubmissionController } from "../../controllers/submission.controller";

interface SubmissionRoutes {
	submissionController: SubmissionController;
}

export async function submissionRoutes(fastify: FastifyInstance, options: SubmissionRoutes) {
	const { submissionController } = options;
	// Create a new submission
	fastify.post("/", submissionController.createSubmission);

	// Update a specific submission status and result
	fastify.patch("/:id", submissionController.updateSubmissionStatus);

	// Get a specific submission
	fastify.get("/:id", submissionController.getSubmission);
}
