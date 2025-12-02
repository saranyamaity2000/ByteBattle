import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { FastifyBaseLogger } from "fastify";
import { InternalServerError } from "../utils/errors";
import { envConfig } from "../configs";

export class ChallengeClient {
	private readonly httpClient: AxiosInstance;

	constructor(private readonly logger: FastifyBaseLogger, private readonly baseURL: string) {
		this.httpClient = axios.create({
			baseURL: this.baseURL,
			timeout: 10000, // 10 seconds timeout
			headers: {
				"Content-Type": "application/json",
				"X-Api-Key": envConfig.X_API_KEY,
			},
		});

		// Add request interceptor for logging
		this.httpClient.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				this.logger.info(
					`Making request to Challenge Service: ${config.method?.toUpperCase()} ${
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
					`Challenge Service response: ${response.status} ${response.statusText}`
				);
				return response;
			},
			(error: AxiosError) => {
				const errorInfo = `Challenge Service error: ${error.response?.status} ${error.response?.statusText} - ${error.message}`;
				this.logger.error(errorInfo);
				return Promise.reject(error);
			}
		);
	}

	async notifySuccessfulSubmission(
		challengeId: string,
		successfulSubmissionBy: string
	): Promise<void> {
		// TODO better specific error handling
		try {
			const response = await this.httpClient.post(`/api/v1/challenges/callback}`, {
				eventName: "submissionSuccess",
				challengeId,
				successfulSubmissionBy,
			});
			if (response.status !== 200) {
				throw new InternalServerError(
					`Failed to notify Challenge Service. Status: ${response.status}`
				);
			}
		} catch (err) {
			throw new InternalServerError(
				`Failed to notify Challenge Service. Status: ${
					(err as AxiosError).response?.status
				}`
			);
		}
	}
}
