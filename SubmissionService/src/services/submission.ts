import { FastifyInstance } from "fastify";
import {
	ISubmission,
	CreateSubmissionRequest,
	SubmissionResponse,
	UpdateSubmissionStatusRequest,
} from "../models/submission";
import { SubmissionRepository } from "../repositories/submission.repository";

export class SubmissionService {
	private submissionRepository: SubmissionRepository;

	constructor(fastify: FastifyInstance) {
		this.submissionRepository = new SubmissionRepository(fastify);
	}

	async createSubmission(submissionData: CreateSubmissionRequest): Promise<SubmissionResponse> {
		const submission: Omit<ISubmission, "_id"> = {
			...submissionData,
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await this.submissionRepository.create(submission);

		const response: SubmissionResponse = {
			id: result.insertedId.toString(),
			problemId: submission.problemId,
			lang: submission.lang,
			status: submission.status,
			createdAt: submission.createdAt.toISOString(),
			updatedAt: submission.updatedAt.toISOString(),
			message: "Submission created successfully",
		};

		return response;
	}

	async getSubmission(id: string): Promise<SubmissionResponse | null> {
		const submission = await this.submissionRepository.findById(id);

		if (!submission) {
			return null;
		}

		return this.mapToResponse(submission);
	}

	async getSubmissionsByProblem(problemId: string): Promise<SubmissionResponse[]> {
		const submissions = await this.submissionRepository.findByProblemId(problemId);
		return submissions.map((submission) => this.mapToResponse(submission));
	}

	async getSubmissionsByUser(userId: string): Promise<SubmissionResponse[]> {
		const submissions = await this.submissionRepository.findByUserId(userId);
		return submissions.map((submission) => this.mapToResponse(submission));
	}

	async updateSubmissionStatus(
		id: string,
		updateData: UpdateSubmissionStatusRequest
	): Promise<SubmissionResponse | null> {
		const result = await this.submissionRepository.updateById(id, updateData);

		if (!result) {
			return null;
		}

		return this.mapToResponse(result);
	}

	private mapToResponse(submission: ISubmission): SubmissionResponse {
		const response: SubmissionResponse = {
			id: submission._id!.toString(),
			problemId: submission.problemId,
			lang: submission.lang,
			status: submission.status,
			createdAt: submission.createdAt.toISOString(),
			updatedAt: submission.updatedAt.toISOString(),
		};

		if (submission.result) {
			response.result = submission.result;
		}

		return response;
	}
}
