import axios from "axios";
import { authInjectionInterceptor } from "./interceptors/authIntercepter";

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_CHALLENGE_SERVICE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// Add request interceptor for logging and authentication
apiClient.interceptors.request.use(authInjectionInterceptor, (error) => {
	return Promise.reject(error);
});

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

export interface ApiChallenge {
	id: string;
	challengedFrom: string;
	challengedTo: string;
	problemId: string;
	timeLimitInMin: number;
	createdAt: string;
	winner?: string;
}

export interface ChallengeService {
	getOnGoingChallenges(): Promise<ApiChallenge[]>;
	getPastChallenges(): Promise<ApiChallenge[]>;
}

class ChallengeServiceImpl implements ChallengeService {
	async getOnGoingChallenges(): Promise<ApiChallenge[]> {
		const response = await apiClient.get<{ success: boolean; data: ApiChallenge[] }>(
			"/challenges/ongoing"
		);
		if (!response.data.success) {
			throw new Error("Failed to fetch ongoing challenges");
		}
		return response.data.data;
	}

	async getPastChallenges(): Promise<ApiChallenge[]> {
		const response = await apiClient.get<{ success: boolean; data: ApiChallenge[] }>(
			"/challenges/past"
		);
		if (!response.data.success) {
			throw new Error("Failed to fetch past challenges");
		}
		return response.data.data;
	}
}

export const challengeService = new ChallengeServiceImpl();
