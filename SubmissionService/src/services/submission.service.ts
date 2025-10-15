import { FastifyBaseLogger } from "fastify";
import { SubmissionRepository } from "../repositories/submission.repository";
import {
	CreateSubmissionRequestDTO,
	SubmissionResponseDTO,
	UpdateSubmissionStatusRequestDTO,
} from "../dtos/submission.dto";
import { NotFoundError, BadRequestError, ExternalServiceError } from "../utils/errors";
import { constantConfig } from "../configs";
import SubmissionPublisherService from "./submission.publisher.service";
import { ProblemClient } from "../clients/problem.client";

export class SubmissionService {
	constructor(
		private readonly logger: FastifyBaseLogger,
		private readonly submissionRepository: SubmissionRepository,
		private readonly publisherService: SubmissionPublisherService,
		private readonly problemClient: ProblemClient
	) {}

	async createSubmission(
		submissionData: CreateSubmissionRequestDTO
	): Promise<SubmissionResponseDTO> {
		try {
			const problemExists = await this.problemClient.checkProblemExists(
				submissionData.problemId
			);
			if (!problemExists) {
				throw new BadRequestError(
					`Problem with slug '${submissionData.problemId}' not found or not published`
				);
			}
		} catch (error) {
			if (error instanceof BadRequestError) {
				throw error;
			}
			this.logger.error(
				`Failed to validate problem existence: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
			throw new ExternalServiceError(
				`Unable to validate problem existence. Please try again later.`
			);
		}

		const submission = await this.submissionRepository.createSubmission(submissionData);
		this.logger.info(`Created submission: ${JSON.stringify(submission)}`);
		await this.publisherService.publishSubmission(constantConfig.SUBMISSION_QUEUE, {
			problemId: submission.problemId,
			submissionId: submission.id,
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
