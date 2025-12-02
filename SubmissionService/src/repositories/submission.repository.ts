import { ISubmission, SubmissionModel } from "../models/submission.model";
import { UpdateSubmissionStatusRequestDTO } from "../dtos/submission.dto";
import mongoose, { ClientSession } from "mongoose";

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
		updateData: UpdateSubmissionStatusRequestDTO,
		session?: ClientSession
	): Promise<ISubmission | null> {
		return SubmissionModel.findByIdAndUpdate(id, updateData, {
			session: session ?? null,
			new: true,
		}).exec();
	}

	async startTransaction(): Promise<ClientSession> {
		const session = await mongoose.startSession();
		session.startTransaction();
		return session;
	}

	async commitTransaction(session: ClientSession): Promise<void> {
		await session.commitTransaction();
		session.endSession();
	}

	async abortTransaction(session: ClientSession): Promise<void> {
		await session.abortTransaction();
		session.endSession();
	}
}
