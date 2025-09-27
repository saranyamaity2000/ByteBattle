import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Create axios instance with default configuration
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000, // 10 seconds timeout
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor for logging (optional)
apiClient.interceptors.request.use(
	(config) => {
		console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
		return config;
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
}

export const problemService = new ProblemService();
