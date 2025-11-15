import { FocusModeContext, type FocusModeContextType } from "@/contexts/FocusModeContext";
import { useContext } from "react";

export const useFocusModeContext = (): FocusModeContextType => {
	const context = useContext(FocusModeContext);
	if (!context) {
		throw new Error("useFocusModeContext must be used within a FocusModeProvider");
	}
	return context;
};
