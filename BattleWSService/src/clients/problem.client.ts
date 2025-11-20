import type { AxiosInstance } from "axios";
import { serverConfig } from "../config/server.config.js";
import axios from "axios";

class ProblemClient {
	private readonly httpClient: AxiosInstance;
	constructor(private readonly problemServiceUrl: string) {
		this.httpClient = axios.create({
			baseURL: problemServiceUrl,
			timeout: 10000, // 10 seconds timeout // TODO make it configurable
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	async fetchRandomProblemId(filter: { difficulty: string }): Promise<string | null> {
		try {
			const response = await this.httpClient.get("/problems/id/random", { params: filter });
			if (response.status !== 200) {
				console.error("Failed to fetch random problem:", response.statusText);
				return null;
			}
			const data = response.data as { data: { problemId: string } };
			return data.data.problemId;
		} catch (error) {
			console.error("Error fetching random problem:", error);
			return null;
		}
	}
}

export const problemClient = new ProblemClient(serverConfig.PROBLEM_SERVICE_URL);
