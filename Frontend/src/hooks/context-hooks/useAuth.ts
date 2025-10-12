import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../../contexts/AuthContext";

export function useAuthContext(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
