/**
 * Retrieves the X_API_KEY from environment variables.
 * @returns The X_API_KEY value
 * @throws Error if X_API_KEY is not set or is empty
 */
export function getXApiKey(): string {
	const xApiKey = process.env.X_API_KEY;
	
	if (!xApiKey || !xApiKey.trim()) {
		throw new Error("X_API_KEY environment variable must be set and non-empty");
	}
	
	return xApiKey;
}
