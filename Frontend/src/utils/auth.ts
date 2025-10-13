import { supabase } from "@/lib/supabase";

/**
 * Get the current user's access token from Supabase session
 * @returns The access token or null if not authenticated
 */
export const getAuthToken = async (): Promise<string | null> => {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session?.access_token || null;
};

/**
 * Get the current user ID from Supabase session
 * @returns The user ID or null if not authenticated
 */
export const getUserId = async (): Promise<string | null> => {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session?.user?.id || null;
};
