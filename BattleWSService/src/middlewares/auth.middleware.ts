import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { type Request, type Response, type NextFunction } from "express";

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client for backend authentication
 * Call this once during app startup
 */
export function initializeSupabase(url: string, serviceRoleKey: string): SupabaseClient {
	if (!url || !serviceRoleKey) {
		throw new Error("Supabase URL and Service Role Key are required");
	}

	supabaseClient = createClient(url, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	console.log("✅ Supabase client initialized for authentication");
	return supabaseClient;
}

/**
 * Get the initialized Supabase client
 */
function getSupabaseClient(): SupabaseClient {
	if (!supabaseClient) {
		throw new Error("Supabase client not initialized. Call initializeSupabase first.");
	}
	return supabaseClient;
}

/**
 * Express middleware to verify Supabase JWT token
 * Extracts user from token and attaches to request object
 */
export async function verifySupabaseToken(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		// Extract token from Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			console.error("Missing or invalid authorization header");
			res.status(401).json({
				error: "Unauthorized",
				message: "Missing or invalid authorization header",
			});
			return;
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		// Verify token with Supabase
		const supabase = getSupabaseClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			console.log("Token verification failed:", error);
			res.status(401).json({
				error: "Unauthorized",
				message: "Invalid or expired token",
			});
			return;
		}

		// Attach user to request object
		req.user = user;
		next();
	} catch (error) {
		console.error("Auth middleware error:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to authenticate request",
		});
	}
}

/**
 * Optional middleware - allows requests without token but attaches user if present
 */
export async function optionalSupabaseAuth(
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			// No token provided, continue without user
			next();
			return;
		}

		const token = authHeader.substring(7);
		const supabase = getSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser(token);

		if (user) {
			req.user = user;
		}

		next();
	} catch (error) {
		// Don't fail the request, just log the error
		console.error("Optional auth error:", error);
		next();
	}
}

export async function verifyInternalAccess(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const xApiKey = req.headers["x-api-key"];
		if (!xApiKey || xApiKey !== process.env.X_API_KEY) {
			res.status(403).json({
				error: "Forbidden",
				message: "No Access",
			});
			return;
		}
		next();
	} catch (error) {
		console.error("Internal access verification error:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to verify internal access",
		});
	}
}
