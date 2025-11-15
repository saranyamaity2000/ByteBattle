import { createContext } from "react";

export interface FocusModeContextType {
	isFocusMode: boolean;
	toggleFocusMode: () => void;
}
export const FocusModeContext = createContext<FocusModeContextType | null>(null);
