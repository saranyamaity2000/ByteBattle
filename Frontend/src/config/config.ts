/**
 * Environment Configuration
 * Centralized configuration management for the ByteBattle application
 */

interface AppConfig {
	problemServiceApi: {
		baseUrl: string;
		timeout: number;
		withCredentials: boolean;
	};
}

const getApiBaseUrl = (): string => {
	const envApiUrl = import.meta.env.VITE_API_BASE_URL;
	if (envApiUrl) {
		return envApiUrl;
	}
	if (import.meta.env.DEV) {
		return "http://localhost:3000/api/v1";
	}
	return "/api/v1";
};

export const config: AppConfig = {
	problemServiceApi: {
		baseUrl: getApiBaseUrl(),
		timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),
		withCredentials: true,
	},
};

// log for debugging in development
if (import.meta.env.DEV) {
	console.log(`API Base URL: ${config.problemServiceApi.baseUrl}`);
}

export default config;
