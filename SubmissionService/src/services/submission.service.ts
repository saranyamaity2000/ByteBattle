import { FastifyBaseLogger } from "fastify";
import { SubmissionRepository } from "../repositories/submission.repository";
import {
	CreateSubmissionRequestDTO,
	SubmissionResponseDTO,
	UpdateSubmissionStatusRequestDTO,
} from "../dtos/submission.dto";
import { NotFoundError } from "../utils/errors";
import { SubmissionPublisherService } from "./submission.publisher.service";
import { constantConfig } from "../configs";

export class SubmissionService {
	constructor(
		private readonly logger: FastifyBaseLogger,
		private readonly submissionRepository: SubmissionRepository,
		private readonly publisherService: SubmissionPublisherService
	) {}

	async createSubmission(
		submissionData: CreateSubmissionRequestDTO
	): Promise<SubmissionResponseDTO> {
		const submission = await this.submissionRepository.createSubmission(submissionData);
		this.logger.info(`Created submission: ${JSON.stringify(submission)}`);
		await this.publisherService.publishMessage(constantConfig.SUBMISSION_QUEUE, {
			id: submission.id,
			code: submission.code,
			lang: submission.lang,
		});
		return submission;
	}

	async getSubmission(id: string): Promise<SubmissionResponseDTO> {
		const submission = await this.submissionRepository.findById(id);
		if (!submission) {
			throw new NotFoundError("Submission not found with id: " + id);
		}
		this.logger.info(`Retrieved submission: ${JSON.stringify(submission)}`);
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
		this.logger.info(`Updated submission: ${JSON.stringify(submission)}`);
		return submission;
	}
}
