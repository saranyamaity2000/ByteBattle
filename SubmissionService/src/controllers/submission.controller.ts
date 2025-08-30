import { FastifyRequest, FastifyReply } from "fastify";
import { SubmissionService } from "../services/submission.service";
import { NotFoundError } from "../utils/errors";
import { CreateSubmissionRequestDTO, UpdateSubmissionStatusRequestDTO } from "../dtos/submission.dto";

interface GetSubmissionParams {
	id: string;
}

export class SubmissionController {
	private submissionService: SubmissionService;

	constructor(submissionService: SubmissionService) {
		this.submissionService = submissionService;
	}

	createSubmission = async (
		request: FastifyRequest<{ Body: CreateSubmissionRequestDTO }>,
		reply: FastifyReply
	) => {
		const submission = await this.submissionService.createSubmission(request.body);
		return reply.code(201).send(submission);
	};

	updateSubmissionStatus = async (
		request: FastifyRequest<{
			Params: GetSubmissionParams;
			Body: UpdateSubmissionStatusRequestDTO;
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
