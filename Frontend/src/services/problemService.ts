import axios from "axios";
import { config } from "@/config/config";

// Create axios instance with centralized configuration
const apiClient = axios.create({
	baseURL: config.problemServiceApi.baseUrl,
	timeout: config.problemServiceApi.timeout,
	withCredentials: config.problemServiceApi.withCredentials,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor for logging in development
apiClient.interceptors.request.use(
	(config_param) => {
		if (import.meta.env.DEV) {
			console.log(
				`Making ${config_param.method?.toUpperCase()} request to ${config_param.url}`
			);
		}
		return config_param;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		console.error("API Error:", error.response?.data || error.message);
		return Promise.reject(error);
	}
);

export interface ApiProblem {
	_id: string;
	title: string;
	slug: string;
	statement: string;
	difficulty: string;
	examples: {
		input: string;
		output: string;
		explanation?: string;
	}[];
	constraints: string[];
	timeLimitMs: number;
	memoryLimitKb: number;
	author: string;
	isPublished: boolean;
	isPremium: boolean;
	submissionsCount: number;
	likes: number;
	editorial: string;
	topicTags: string[];
	companyTags: string[];
	createdAt: string;
	updatedAt: string;
	__v: number;
	testcaseUrl: string;
}

export interface ApiResponse<T> {
	data: T;
}

export interface CreateProblemPayload {
	title: string;
	slug?: string;
	statement: string;
	difficulty: "easy" | "medium" | "hard";
	examples: {
		input: string;
		output: string;
		explanation?: string;
	}[];
	constraints?: string[];
	timeLimitMs?: number;
	memoryLimitKb?: number;
	author?: string;
	isPremium?: boolean;
	editorial?: string;
	topicTags?: string[];
	companyTags?: string[];
}

// Simple utility to extract filename from content-disposition header
const extractFilename = (contentDisposition: string): string | undefined => {
	// Handle both quoted and unquoted filenames
	const patterns = [
		{ regex: /filename\*=UTF-8''([^;]+)/i, isRFC5987: true }, // RFC 5987 format
		{ regex: /filename="([^"]+)"/i, isRFC5987: false }, // Quoted format
		{ regex: /filename=([^;]+)/i, isRFC5987: false }, // Unquoted format
	];

	for (const { regex, isRFC5987 } of patterns) {
		const match = contentDisposition.match(regex);
		if (match && match[1]) {
			// Decode URI component if it's the RFC 5987 format
			const filename = isRFC5987 ? decodeURIComponent(match[1]) : match[1].trim();
			return filename;
		}
	}
	return undefined;
};

class ProblemService {
	async getProblems(): Promise<ApiProblem[]> {
		try {
			const response = await apiClient.get<ApiResponse<ApiProblem[]>>("/problems");
			return response.data.data;
		} catch (error) {
			console.error("Error fetching problems:", error);
			throw new Error("Failed to fetch problems");
		}
	}

	async getProblemById(id: string): Promise<ApiProblem | null> {
		try {
			const response = await apiClient.get<ApiResponse<ApiProblem>>(`/problems/${id}`);
			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return null; // Problem not found
			}
			console.error("Error fetching problem by ID:", error);
			throw new Error(`Failed to fetch problem with ID: ${id}`);
		}
	}

	async createProblem(payload: CreateProblemPayload): Promise<ApiProblem> {
		try {
			const response = await apiClient.post<ApiResponse<ApiProblem>>("/problems", payload);
			return response.data.data;
		} catch (error) {
			console.error("Error creating problem:", error);
			throw error;
		}
	}

	async publishProblem(slug: string): Promise<ApiProblem> {
		try {
			const response = await apiClient.patch<ApiResponse<ApiProblem>>(
				`/problems/${slug}/publish`
			);
			return response.data.data;
		} catch (error) {
			console.error("Error publishing problem:", error);
			if (axios.isAxiosError(error)) {
				const message = error.response?.data?.message || "Failed to publish problem";
				throw new Error(message);
			}
			throw error;
		}
	}

	async uploadTestcase(slug: string, file: File): Promise<{ message: string }> {
		try {
			const formData = new FormData();
			formData.append("testcase", file);

			const response = await apiClient.post<{ message: string }>(
				`/testcases/upload/${slug}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error uploading testcase:", error);
			if (axios.isAxiosError(error)) {
				const message = error.response?.data?.message || "Failed to upload testcase";
				throw new Error(message);
			}
			throw error;
		}
	}

	async downloadTestcase(slug: string): Promise<{ blob: Blob; filename?: string }> {
		try {
			const response = await apiClient.get(`/testcases/download/${slug}`, {
				responseType: "blob",
			});

			// Extract filename from content-disposition header elegantly
			const contentDispositionHeader = response.headers["content-disposition"];
			let filename: string | undefined;

			if (contentDispositionHeader) {
				filename = extractFilename(contentDispositionHeader);
			}

			return {
				blob: response.data,
				filename: filename || `${slug}-testcases.json`, // fallback filename
			};
		} catch (error) {
			console.error("Error downloading testcase:", error);
			if (axios.isAxiosError(error)) {
				const message = error.response?.data?.message || "Failed to download testcase";
				throw new Error(message);
			}
			throw error;
		}
	}
}

export const problemService = new ProblemService();
