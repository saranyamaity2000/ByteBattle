import { FocusModeContext } from "@/contexts/FocusModeContext";
import { useState, type PropsWithChildren } from "react";

export const FocusModeProvider: React.FC<PropsWithChildren> = (props) => {
	const [isFocusMode, setIsFocusMode] = useState(false);
	const toggleFocusMode = () => {
		setIsFocusMode(!isFocusMode);
	};
	return (
		<FocusModeContext.Provider value={{ isFocusMode, toggleFocusMode }}>
			{props.children}
		</FocusModeContext.Provider>
	);
};
