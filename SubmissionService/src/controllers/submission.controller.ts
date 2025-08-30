import { FastifyRequest, FastifyReply } from "fastify";
import { CreateSubmissionRequest, UpdateSubmissionStatusRequest } from "../models/submission";
import { SubmissionService } from "../services/submission";
import { NotFoundError } from "../utils/errors";

interface GetSubmissionParams {
	id: string;
}

export class SubmissionController {
	private submissionService: SubmissionService;

	constructor(submissionService: SubmissionService) {
		this.submissionService = submissionService;
	}

	createSubmission = async (
		request: FastifyRequest<{ Body: CreateSubmissionRequest }>,
		reply: FastifyReply
	) => {
		const submission = await this.submissionService.createSubmission(request.body);
		return reply.code(201).send(submission);
	};

	updateSubmissionStatus = async (
		request: FastifyRequest<{
			Params: GetSubmissionParams;
			Body: UpdateSubmissionStatusRequest;
		}>,
		reply: FastifyReply
	) => {
		const updatedSubmission = await this.submissionService.updateSubmissionStatus(
			request.params.id,
			request.body
		);

		if (!updatedSubmission) {
			throw new NotFoundError(`Submission with id ${request.params.id} not found`);
		}
		return reply.send(updatedSubmission);
	};

	getSubmission = async (
		request: FastifyRequest<{ Params: GetSubmissionParams }>,
		reply: FastifyReply
	) => {
		const submission = await this.submissionService.getSubmission(request.params.id);
		if (!submission) {
			throw new NotFoundError(`Submission with id ${request.params.id} not found`);
		}
		return reply.send(submission);
	};
}
