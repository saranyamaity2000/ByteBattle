import { BattleSocketContext, type BattleSocketContextType } from "@/contexts/BattleSocketContext";
import { useContext } from "react";

export const useBattleSocketContext = (): BattleSocketContextType => {
	const context = useContext(BattleSocketContext);
	if (!context) {
		throw new Error("useBattleSocketContext must be used within a BattleSocketProvider");
	}
	return context;
};
