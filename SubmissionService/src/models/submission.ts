import { ObjectId } from "mongodb";

export enum SupportedSubmissionLang {
	CPP = "c++",
	PYTHON3 = "python3",
}

export type SubmissionStatus = "pending" | "processing" | "completed" | "failed";

export enum SubmissionVerdict {
	ACCEPTED = "accepted",
	WRONG_ANSWER = "wrong_answer",
	TIME_LIMIT_EXCEEDED = "time_limit_exceeded",
	RUNTIME_ERROR = "runtime_error",
	COMPILATION_ERROR = "compilation_error",
}

export interface ISubmissionResult {
	verdict: SubmissionVerdict;
	score?: number;
	executionTime?: number;
	memoryUsed?: number;
	testCasesPassed?: number;
	totalTestCases?: number;
	error?: string;
}

export interface ISubmission {
	_id?: ObjectId;
	problemId: string;
	lang: SupportedSubmissionLang;
	code: string;
	userId?: string;
	status: SubmissionStatus;
	result?: ISubmissionResult;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateSubmissionRequest {
	problemId: string;
	lang: SupportedSubmissionLang;
	code: string;
	userId?: string;
}

export interface SubmissionResponse {
	id: string;
	problemId: string;
	lang: SupportedSubmissionLang;
	status: SubmissionStatus;
	result?: ISubmissionResult;
	createdAt: string;
	updatedAt?: string;
	message?: string;
}

export interface UpdateSubmissionStatusRequest {
	status: SubmissionStatus;
	result?: ISubmissionResult;
}
