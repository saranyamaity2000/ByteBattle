import { FastifyInstance } from "fastify";
import { SubmissionRepository } from "../repositories/submission.repository";
import {
	CreateSubmissionRequestDTO,
	SubmissionResponseDTO,
	UpdateSubmissionStatusRequestDTO,
} from "../dtos/submission.dto";
import { NotFoundError } from "../utils/errors";

export class SubmissionService {
	constructor(
		private readonly fastify: FastifyInstance,
		private readonly submissionRepository: SubmissionRepository
	) {}

	async createSubmission(
		submissionData: CreateSubmissionRequestDTO
	): Promise<SubmissionResponseDTO> {
		const submission = await this.submissionRepository.createSubmission(submissionData);
		this.fastify.log.info(`Created submission: ${JSON.stringify(submission)}`);
		return submission;
	}

	async getSubmission(id: string): Promise<SubmissionResponseDTO> {
		const submission = await this.submissionRepository.findById(id);
		if (!submission) {
			throw new NotFoundError("Submission not found with id: " + id);
		}
		this.fastify.log.info(`Retrieved submission: ${JSON.stringify(submission)}`);
		return submission;
	}

	async updateSubmissionStatus(
		id: string,
		updateData: UpdateSubmissionStatusRequestDTO
	): Promise<SubmissionResponseDTO> {
		const submission = await this.submissionRepository.updateById(id, updateData);
		if (!submission) {
			throw new NotFoundError("Submission not found with id: " + id);
		}
		this.fastify.log.info(`Updated submission: ${JSON.stringify(submission)}`);
		return submission;
	}
}
