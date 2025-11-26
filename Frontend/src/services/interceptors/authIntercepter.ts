import { getAuthToken } from "@/utils/auth";
import type { InternalAxiosRequestConfig } from "axios";

export const authInjectionInterceptor = async (config_param: InternalAxiosRequestConfig) => {
	if (import.meta.env.DEV) {
		console.log(`Making ${config_param.method?.toUpperCase()} request to ${config_param.url}`);
	}
	// Add Authorization header with Bearer token if user is authenticated
	const token = await getAuthToken();
	if (token) {
		config_param.headers.Authorization = `Bearer ${token}`;
	}
	return config_param;
};
