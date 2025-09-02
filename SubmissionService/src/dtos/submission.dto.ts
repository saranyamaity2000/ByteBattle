import {
	ISubmissionResult,
	SubmissionStatus,
	SupportedSubmissionLang,
} from "../models/submission.model";

export interface CreateSubmissionRequestDTO {
	problemId: string;
	lang: SupportedSubmissionLang;
	code: string;
	userId?: string;
}

export interface SubmissionResponseDTO {
	problemId: string;
	lang: SupportedSubmissionLang;
	status: SubmissionStatus;
	result?: ISubmissionResult;
	createdAt: Date;
	updatedAt?: Date;
	message?: string;
}

export interface UpdateSubmissionStatusRequestDTO {
	status: SubmissionStatus;
	result?: ISubmissionResult;
}

export interface SubmissionQueueMessageDTO {
	id: string;
	code: string;
	lang: string;
}