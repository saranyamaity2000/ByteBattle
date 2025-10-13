/**
 * Test utilities for authentication in tests
 * This module provides mock auth tokens and middleware bypass for testing
 */

import { Request, Response, NextFunction } from "express";
import { User } from "@supabase/supabase-js";

/**
 * Mock user for testing
 */
export const mockUser: User = {
	id: "test-user-id-123",
	app_metadata: {},
	user_metadata: {},
	aud: "authenticated",
	created_at: new Date().toISOString(),
	email: "test@example.com",
};

/**
 * Mock Supabase token verification middleware for tests
 * This bypasses actual token verification and injects a mock user
 */
export const mockVerifySupabaseToken = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	// Inject mock user into request
	req.user = mockUser;
	next();
};

/**
 * Mock optional auth middleware for tests
 */
export const mockOptionalSupabaseAuth = async (
	req: Request,
	_res: Response,
	next: NextFunction
): Promise<void> => {
	// Optionally inject mock user if Authorization header is present
	if (req.headers.authorization) {
		req.user = mockUser;
	}
	next();
};

/**
 * Generate a fake JWT token for testing (not validated)
 * Use this when you need to pass a token in tests
 */
export const generateMockToken = (): string => {
	return "mock-jwt-token-for-testing";
};

/**
 * Create authorization header for tests
 */
export const createAuthHeader = (): { Authorization: string } => {
	return {
		Authorization: `Bearer ${generateMockToken()}`,
	};
};
