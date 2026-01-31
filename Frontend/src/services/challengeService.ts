import axios from "axios";
import { config } from "@/config/config";
import { authInjectionInterceptor } from "./interceptors/authIntercepter";

const apiClient = axios.create({
	baseURL: config.challengeServiceApi.baseUrl,
	timeout: config.challengeServiceApi.timeout,
	headers: {
		"Content-Type": "application/json",
	},
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
	},
);

export interface ApiChallenge {
	challengeId: string;
	challengedFrom: string;
	challengedTo: string;
	problemId: string;
	timeLimitInMin: number;
	createdAt: string;
	updatedAt: string;
	winner?: string;
}

export interface ChallengeService {
	getOnGoingChallenges(): Promise<ApiChallenge[]>;
	getPastChallenges(): Promise<ApiChallenge[]>;
	getChallengeById(challengeId: string): Promise<ApiChallenge | null>;
	isAvailableForChallenge(opponentEmail: string): Promise<boolean>;
}

class ChallengeServiceImpl implements ChallengeService {
	async getOnGoingChallenges(): Promise<ApiChallenge[]> {
		const response = await apiClient.get<{ success: boolean; data: ApiChallenge[] }>(
			"/challenges/ongoing",
		);
		if (!response.data.success) {
			throw new Error("Failed to fetch ongoing challenges");
		}
		return response.data.data;
	}

	async getPastChallenges(): Promise<ApiChallenge[]> {
		const response = await apiClient.get<{ success: boolean; data: ApiChallenge[] }>(
			"/challenges/past",
		);
		if (!response.data.success) {
			throw new Error("Failed to fetch past challenges");
		}
		return response.data.data;
	}

	async getChallengeById(challengeId: string): Promise<ApiChallenge | null> {
		try {
			const response = await apiClient.get<
				{ success: true; data: ApiChallenge } | { success: false; error: string }
			>(`/challenges/${challengeId}`);
			if (!response.data.success) {
				console.error("Failed to fetch challenge by ID:", response.data.error);
				return null;
			}
			return response.data.data;
		} catch (error) {
			console.error("Error fetching challenge by ID:", error);
			return null;
		}
	}

	async isAvailableForChallenge(opponentEmail: string): Promise<boolean> {
		try {
			const response = await apiClient.get<
				{ success: true; data: { online: boolean } } | { success: false; error: string }
			>(`/challenges/available/${opponentEmail}`);
			if (response.data.success) {
				return response.data.data.online;
			} else {
				throw new Error(response.data.error);
			}
		} catch (err) {
			console.error("Error fetching challenge by ID:", err);
		}
		return false;
	}
}

export const challengeService = new ChallengeServiceImpl();
