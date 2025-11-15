import { createContext } from "react";
import { Socket } from "socket.io-client";

export type UsableSocket = Exclude<Socket, "connect" | "disconnect">;
export type BattleSocketContextType = {
	battleSocket: UsableSocket | null;
	isSocketConnected: boolean;
};
export const BattleSocketContext = createContext<BattleSocketContextType | undefined>(undefined);
