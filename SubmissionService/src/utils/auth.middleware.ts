import { FastifyRequest, FastifyReply } from "fastify";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

// Extend Fastify request with user property
declare module "fastify" {
	interface FastifyRequest {
		user?: User;
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
 * Fastify preHandler hook to verify Supabase JWT token
 */
export async function verifySupabaseToken(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		// Extract token from Authorization header
		const authHeader = request.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return reply.code(401).send({
				error: "Unauthorized",
				message: "Missing or invalid authorization header",
			});
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		// Verify token with Supabase
		const supabase = getSupabaseClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			return reply.code(401).send({
				error: "Unauthorized",
				message: "Invalid or expired token",
			});
		}

		// Attach user to request object
		request.user = user;
	} catch (error) {
		request.log.error({ error }, "Auth middleware error");
		return reply.code(500).send({
			error: "Internal Server Error",
			message: "Failed to authenticate request",
		});
	}
}

/**
 * Optional middleware - allows requests without token but attaches user if present
 */
export async function optionalSupabaseAuth(
	request: FastifyRequest,
	_reply: FastifyReply
): Promise<void> {
	try {
		const authHeader = request.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			// No token provided, continue without user
			return;
		}

		const token = authHeader.substring(7);
		const supabase = getSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser(token);

		if (user) {
			request.user = user;
		}
	} catch (error) {
		// Don't fail the request, just log the error
		request.log.error({ error }, "Optional auth error");
	}
}
