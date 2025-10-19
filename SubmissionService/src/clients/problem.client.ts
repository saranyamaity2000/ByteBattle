import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { FastifyBaseLogger } from "fastify";

export interface ProblemClientResponse {
	data: {
		id: string;
		slug: string;
		title: string;
		isPublished: boolean;
		// Add other fields as needed
	};
}

export class ProblemClient {
	private readonly httpClient: AxiosInstance;

	constructor(private readonly logger: FastifyBaseLogger, private readonly baseURL: string) {
		this.httpClient = axios.create({
			baseURL: this.baseURL,
			timeout: 10000, // 10 seconds timeout
			headers: {
				"Content-Type": "application/json",
			},
		});

		// Add request interceptor for logging
		this.httpClient.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				this.logger.info(
					`Making request to Problem Service: ${config.method?.toUpperCase()} ${
						config.url
					}`
				);
				return config;
			},
			(error: any) => {
				this.logger.error(
					`Request interceptor error: ${error?.message || "Unknown error"}`
				);
				return Promise.reject(error);
			}
		);

		// Add response interceptor for logging
		this.httpClient.interceptors.response.use(
			(response: AxiosResponse) => {
				this.logger.info(
					`Problem Service response: ${response.status} ${response.statusText}`
				);
				return response;
			},
			(error: AxiosError) => {
				const errorInfo = `Problem Service error: ${error.response?.status} ${error.response?.statusText} - ${error.message}`;
				this.logger.error(errorInfo);
				return Promise.reject(error);
			}
		);
	}

	/**
	 * Check if a problem exists by slug
	 * @param slug - The problem slug (equivalent to problemId in submission service)
	 * @returns Promise<boolean> - true if problem exists and is published, false otherwise
	 */
	async checkProblemExists(slug: string): Promise<boolean> {
		try {
			const response = await this.httpClient.get<ProblemClientResponse>(
				`/api/v1/problems/${slug}`
			);

			// Check if problem exists and is published
			const problem = response.data.data;
			if (!problem) {
				this.logger.warn(`Problem with slug ${slug} not found`);
				return false;
			}
			if (!problem.isPublished) {
				this.logger.warn(`Problem with slug ${slug} exists but is not published`);
				return false;
			}
			this.logger.info(`Problem with slug ${slug} exists and is published`);
			return true;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 404) {
					this.logger.warn(`Problem with slug ${slug} not found (404)`);
					return false;
				}
				// For other HTTP errors, we should throw to let the caller handle it
				this.logger.error(`HTTP error while checking problem ${slug}: ${error.message}`);
				throw new Error(`Failed to verify problem existence: ${error.message}`);
			}

			// For network errors or other issues
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			this.logger.error(`Network error while checking problem ${slug}: ${errorMessage}`);
			throw new Error(`Failed to connect to Problem Service: ${errorMessage}`);
		}
	}
}
