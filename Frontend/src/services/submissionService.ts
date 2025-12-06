import axios from "axios";
import { authInjectionInterceptor } from "./interceptors/authIntercepter";

// Create axios instance for submission service
const submissionApiClient = axios.create({
	baseURL: import.meta.env.VITE_SUBMISSION_SERVICE_URL || "http://localhost:3002/api/v1",
	timeout: 30000, // 30 seconds timeout for code execution
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor for authentication
submissionApiClient.interceptors.request.use(authInjectionInterceptor, (error) => {
	return Promise.reject(error);
});

// Add response interceptor for error handling
submissionApiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		console.error("Submission API Error:", error.response?.data || error.message);
		return Promise.reject(error);
	}
);

export type SupportedLanguage = "c++" | "python3";

export interface CreateSubmissionPayload {
	problemId: string;
	lang: SupportedLanguage;
	code: string;
	challengeId?: string; // Optional: Include when submission is part of a challenge
}

export enum VerdictEnum {
	Accepted = "accepted",
	WrongAnswer = "wrong answer",
	TimeLimitExceeded = "time limit exceeded",
	MemoryLimitExceeded = "memory limit exceeded",
	RuntimeError = "runtime error",
	CompileError = "compilation error",
	FailedToSubmit = "failed to submit",
}

export interface SubmissionResult {
	verdict: VerdictEnum | string;
	score?: number;
	executionTime?: number;
	memoryUsed?: number;
	testCasesPassed?: number;
	totalTestCases?: number;
	error?: string;
}

export interface Submission {
	id: string;
	problemId: string;
	lang: SupportedLanguage;
	code: string;
	userId: string;
	status: "pending" | "processing" | "completed" | "failed";
	result?: SubmissionResult;
	challengeId?: string; // Optional: Present when submission is part of a challenge
	createdAt: string;
	updatedAt: string;
}

class SubmissionService {
	/**
	 * Submit code for evaluation
	 */
	async submitCode(payload: CreateSubmissionPayload): Promise<Submission> {
		try {
			const response = await submissionApiClient.post<Submission>("/submissions", payload);
			return response.data;
		} catch (error) {
			console.error("Error submitting code:", error);
			if (axios.isAxiosError(error)) {
				const message = error.response?.data?.message || "Failed to submit code";
				throw new Error(message);
			}
			throw error;
		}
	}

	/**
	 * Get submission by ID
	 */
	async getSubmission(submissionId: string): Promise<Submission> {
		try {
			const response = await submissionApiClient.get<Submission>(
				`/submissions/${submissionId}`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching submission:", error);
			if (axios.isAxiosError(error)) {
				const message = error.response?.data?.message || "Failed to fetch submission";
				throw new Error(message);
			}
			throw error;
		}
	}

	/**
	 * Poll submission status until completed or failed
	 */
	async pollSubmissionStatus(
		submissionId: string,
		maxAttempts: number = 30,
		intervalMs: number = 1000
	): Promise<Submission> {
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const submission = await this.getSubmission(submissionId);

			if (submission.status === "completed" || submission.status === "failed") {
				return submission;
			}

			// Wait before next poll
			await new Promise((resolve) => setTimeout(resolve, intervalMs));
		}

		throw new Error("Submission timeout: evaluation took too long");
	}
}

export const submissionService = new SubmissionService();
