import { getAuthToken } from "@/utils/auth";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { io } from "socket.io-client";
import { useFocusModeContext } from "@/hooks/context-hooks/useFocusModeContext";
import { BattleSocketContext, type UsableSocket } from "@/contexts/BattleSocketContext";

export const BattleSocketProvider = (props: PropsWithChildren) => {
	const [isSocketConnected, setIsSocketConnected] = useState(false);

	const battleSocketRef = useRef<UsableSocket>(
		io(import.meta.env.VITE_BATTLE_SOCKET_URL, {
			autoConnect: false,
			auth: async (cb) => {
				const token = await getAuthToken();
				cb({ token });
			},
		}) satisfies UsableSocket
	);
	const { isFocusMode } = useFocusModeContext();

	// socket connection related effect
	useEffect(() => {
		battleSocketRef.current.on("connect", () => setIsSocketConnected(true));
		battleSocketRef.current.on("disconnect", () => setIsSocketConnected(false));
		return () => {
			battleSocketRef.current.off("connect");
			battleSocketRef.current.off("disconnect");
		};
	}, []);

	// focusMode related effect
	useEffect(() => {
		if (isFocusMode) battleSocketRef.current.disconnect();
		else battleSocketRef.current.connect();
	}, [isFocusMode]);

	return (
		<BattleSocketContext.Provider
			value={{
				battleSocket: battleSocketRef.current,
				isSocketConnected,
			}}
		>
			{props.children}
		</BattleSocketContext.Provider>
	);
};
