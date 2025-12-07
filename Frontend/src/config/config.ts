/**
 * Environment Configuration
 * Centralized configuration management for the ByteBattle application
 */

interface ServiceConfig {
	baseUrl: string;
	timeout: number;
	withCredentials?: boolean;
}

interface AppConfig {
	problemServiceApi: ServiceConfig;
	submissionServiceApi: ServiceConfig;
	challengeServiceApi: ServiceConfig;
}

const getServiceUrl = (envKey: string, devDefault: string): string => {
	const envUrl = import.meta.env[envKey];
	if (envUrl) {
		return envUrl;
	}
	if (import.meta.env.DEV) {
		return devDefault;
	}
	return devDefault;
};

const getTimeout = (): number => {
	return parseInt(import.meta.env.VITE_API_TIMEOUT || "100000", 10); // default 100 seconds
};

export const config: AppConfig = {
	problemServiceApi: {
		baseUrl: getServiceUrl("VITE_PROBLEM_SERVICE_URL", "http://localhost:3000/api/v1"),
		timeout: getTimeout(),
		withCredentials: true,
	},
	submissionServiceApi: {
		baseUrl: getServiceUrl("VITE_SUBMISSION_SERVICE_URL", "http://localhost:3001/api/v1"),
		timeout: getTimeout(),
		withCredentials: true,
	},
	challengeServiceApi: {
		baseUrl: getServiceUrl("VITE_CHALLENGE_SERVICE_URL", "http://localhost:3101/api/v1"),
		timeout: getTimeout(),
		withCredentials: true,
	},
};

// log for debugging in development
if (import.meta.env.DEV) {
	console.log("ByteBattle Frontend Configuration:");
	console.log(`  Problem Service API: ${config.problemServiceApi.baseUrl}`);
	console.log(`  Submission Service API: ${config.submissionServiceApi.baseUrl}`);
	console.log(`  Challenge Service API: ${config.challengeServiceApi.baseUrl}`);
}

export default config;
