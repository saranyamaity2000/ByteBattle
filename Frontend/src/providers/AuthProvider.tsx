import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
			
			// Check if there's a redirect path after successful auth
			if (session?.user) {
				const redirectPath = sessionStorage.getItem("auth_redirect_path");
				if (redirectPath) {
					sessionStorage.removeItem("auth_redirect_path");
					window.location.href = redirectPath;
				}
			}
		});

		// Listen for auth changes (automatic session persistence!)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signInWithGoogle = async (redirectPath?: string) => {
		setLoading(true);
		
		// Store redirect path in session storage if provided
		if (redirectPath) {
			sessionStorage.setItem("auth_redirect_path", redirectPath);
		}
		
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: window.location.origin,
			},
		});
        setLoading(false);
		if (error) {
			console.error("Error signing in with Google:", error.message);
		}
	};

	const signOut = async () => {
		setLoading(true);
		const { error } = await supabase.auth.signOut();
		setLoading(false);
		if (error) {
			console.error("Error signing out:", error.message);
		}
	};

	const value: AuthContextType = {
		user,
		session,
		loading,
		signInWithGoogle,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
