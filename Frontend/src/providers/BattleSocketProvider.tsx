import { getAuthToken } from "@/utils/auth";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { io } from "socket.io-client";
import { useFocusModeContext } from "@/hooks/context-hooks/useFocusModeContext";
import { BattleSocketContext, type UsableSocket } from "@/contexts/BattleSocketContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChallangeRequest } from "@/components/ChallangeRequest";
import { usePageLoaderContext } from "@/hooks/context-hooks/usePageLoaderContext";
import { problemService } from "@/services/problemService";

type ChallangeRequestData = {
	challangedBy: string;
	challengeId: string;
};

type MatchStartData = {
	challangedBy: string;
	challangedTo: string;
	challengeId: string;
	problemId: string;
};

export const BattleSocketProvider = (props: PropsWithChildren) => {
	const [isSocketConnected, setIsSocketConnected] = useState(false);
	const [isChallangeRequestOpen, setIsChallangeRequestOpen] = useState(false);
	const [challangeRequestData, setChallangeRequestData] = useState<ChallangeRequestData | null>(
		null
	);
	// Store match data for future use (e.g., redirecting to battle page)

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
	const { setIsPageLoading } = usePageLoaderContext();

	// onMount and onUnmount
	useEffect(() => {
		const socket = battleSocketRef.current;

		const handleConnect = () => setIsSocketConnected(true);
		const handleDisconnect = () => setIsSocketConnected(false);
		const handleChallenged = (data: ChallangeRequestData) => {
			setIsChallangeRequestOpen(true);
			setChallangeRequestData(data);
		};
		const handleMatchStart = (data: MatchStartData) => {
			console.log("Match started with data:", data);
			problemService
				.getProblemSlugById(data.problemId)
				.then((slug) => {
					window.location.href = `/problem/${slug}`; // navigate to the problem page (useNavigate not working here)
				})
				.catch((err) => {
					console.error("Failed to get problem slug:", err);
					alert("Failed to start match: Problem not found");
				})
				.finally(() => {
					setIsPageLoading(false);
					setIsChallangeRequestOpen(false);
				});
		};
		const handleChallengeRejected = () => {
			setIsPageLoading(false);
			console.log("Challenge was rejected");
			alert("Your challenge was rejected");
		};

		socket.on("connect", handleConnect);
		socket.on("disconnect", handleDisconnect);
		socket.on("challenged", handleChallenged);
		socket.on("match_start", handleMatchStart);
		socket.on("challenge-rejected", handleChallengeRejected);

		return () => {
			socket.off("connect", handleConnect);
			socket.off("disconnect", handleDisconnect);
			socket.off("challenged", handleChallenged);
			socket.off("match_start", handleMatchStart);
			socket.off("challenge-rejected", handleChallengeRejected);
			socket.disconnect();
		};
	}, [setIsPageLoading]);

	const onAcceptChallenge = () => {
		if (!challangeRequestData) return;
		setIsPageLoading(true);
		battleSocketRef.current.emit("challenge-reply", {
			challangeId: challangeRequestData.challengeId,
			hasAccepted: true,
		});
	};
	const onRejectChallenge = () => {
		if (!challangeRequestData) return;
		battleSocketRef.current.emit("challenge-reply", {
			challangeId: challangeRequestData.challengeId,
			hasAccepted: false,
		});
		setIsChallangeRequestOpen(false);
	};

	// focusMode related effect
	useEffect(() => {
		const socket = battleSocketRef.current;
		if (isFocusMode) socket.disconnect();
		else socket.connect();
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
							acceptChallenge={onAcceptChallenge}
							rejectChallenge={onRejectChallenge}
						></ChallangeRequest>
					</DialogContent>
				</Dialog>
			</>
		</BattleSocketContext.Provider>
	);
};
