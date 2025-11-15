import { getAuthToken } from "@/utils/auth";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { io } from "socket.io-client";
import { useFocusModeContext } from "@/hooks/context-hooks/useFocusModeContext";
import { BattleSocketContext, type UsableSocket } from "@/contexts/BattleSocketContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChallangeRequest } from "@/components/ChallangeRequest";

type ChallangeRequestData = {
	challangedBy: string;
	challengeId: string;
};

export const BattleSocketProvider = (props: PropsWithChildren) => {
	const [isSocketConnected, setIsSocketConnected] = useState(false);
	const [isChallangeRequestOpen, setIsChallangeRequestOpen] = useState(false);
	const [challangeRequestData, setChallangeRequestData] = useState<ChallangeRequestData | null>(
		null
	);

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

	// onMount and onUnmount
	useEffect(() => {
		battleSocketRef.current.on("connect", () => setIsSocketConnected(true));
		battleSocketRef.current.on("disconnect", () => setIsSocketConnected(false));
		battleSocketRef.current.on("challenged", (data: ChallangeRequestData) => {
			setIsChallangeRequestOpen(true);
			setChallangeRequestData(data);
		});
		return () => {
			battleSocketRef.current.off("connect");
			battleSocketRef.current.off("disconnect");
			battleSocketRef.current.off("challenged");
			battleSocketRef.current.disconnect();
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
			<>
				{props.children}
				<Dialog open={isChallangeRequestOpen} onOpenChange={setIsChallangeRequestOpen}>
					<DialogContent>
						<ChallangeRequest
							challangedBy={challangeRequestData?.challangedBy ?? ""}
							challengeId={challangeRequestData?.challengeId ?? ""}
							acceptChallenge={() => {}}
							rejectChallenge={() => {}}
						></ChallangeRequest>
					</DialogContent>
				</Dialog>
			</>
		</BattleSocketContext.Provider>
	);
};
