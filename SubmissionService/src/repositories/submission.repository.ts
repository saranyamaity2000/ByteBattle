import { ISubmission, SubmissionModel } from "../models/submission.model";
import { UpdateSubmissionStatusRequestDTO } from "../dtos/submission.dto";

export class SubmissionRepository {
	async createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission> {
		const submission = new SubmissionModel(submissionData);
		return submission.save();
	}

	async findById(id: string): Promise<ISubmission | null> {
		return SubmissionModel.findById(id).exec();
	}

	async updateById(
		id: string,
		updateData: UpdateSubmissionStatusRequestDTO
	): Promise<ISubmission | null> {
		return SubmissionModel.findByIdAndUpdate(id, updateData).exec();
	}
}
