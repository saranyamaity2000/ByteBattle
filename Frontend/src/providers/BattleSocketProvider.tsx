import { getAuthToken } from "@/utils/auth";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { io } from "socket.io-client";
import { useFocusModeContext } from "@/hooks/context-hooks/useFocusModeContext";
import { BattleSocketContext, type UsableSocket } from "@/contexts/BattleSocketContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChallengeRequest } from "@/components/ChallengeRequest";
import { usePageLoaderContext } from "@/hooks/context-hooks/usePageLoaderContext";
import { problemService } from "@/services/problemService";

type ChallengeRequestData = {
	challengedBy: string;
	challengeId: string;
	timeLimit: number;
	difficulty: string;
};

type MatchStartData = {
	challengedBy: string;
	challengedTo: string;
	challengeId: string;
	problemId: string;
	timeLimit: number;
	difficulty: string;
};

export const BattleSocketProvider = (props: PropsWithChildren) => {
	const [isSocketConnected, setIsSocketConnected] = useState(false);
	const [isChallengeRequestOpen, setIsChallengeRequestOpen] = useState(false);
	const [challengeRequestData, setChallengeRequestData] = useState<ChallengeRequestData | null>(
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
		const handleChallenged = (data: ChallengeRequestData) => {
			setIsChallengeRequestOpen(true);
			setChallengeRequestData(data);
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
					setIsChallengeRequestOpen(false);
				});
		};
		const handleChallengeRejected = () => {
			setIsPageLoading(false);
			setIsChallengeRequestOpen(false);
			console.log("Challenge was rejected");
			alert("Your challenge was rejected");
		};
		const handleMatchError = (data: { challengeId: string; error: string }) => {
			setIsPageLoading(false);
			setIsChallengeRequestOpen(false);
			console.error("Match error:", data.error);
			alert(`Failed to start match: ${data.error}`);
		};

		socket.on("connect", handleConnect);
		socket.on("disconnect", handleDisconnect);
		socket.on("challenged", handleChallenged);
		socket.on("match_start", handleMatchStart);
		socket.on("challenge-rejected", handleChallengeRejected);
		socket.on("match_error", handleMatchError);

		return () => {
			socket.off("connect", handleConnect);
			socket.off("disconnect", handleDisconnect);
			socket.off("challenged", handleChallenged);
			socket.off("match_start", handleMatchStart);
			socket.off("challenge-rejected", handleChallengeRejected);
			socket.off("match_error", handleMatchError);
			socket.disconnect();
		};
	}, [setIsPageLoading]);

	const onAcceptChallenge = () => {
		if (!challengeRequestData) return;
		setIsPageLoading(true);
		battleSocketRef.current.emit("challenge-reply", {
			challengeId: challengeRequestData.challengeId,
			hasAccepted: true,
		});
	};
	const onRejectChallenge = () => {
		if (!challengeRequestData) return;
		battleSocketRef.current.emit("challenge-reply", {
			challengeId: challengeRequestData.challengeId,
			hasAccepted: false,
		});
		setIsChallengeRequestOpen(false);
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
				<Dialog open={isChallengeRequestOpen} onOpenChange={setIsChallengeRequestOpen}>
					<DialogContent>
						<ChallengeRequest
							challengedBy={challengeRequestData?.challengedBy ?? ""}
							challengeId={challengeRequestData?.challengeId ?? ""}
							timeLimit={challengeRequestData?.timeLimit}
							difficulty={challengeRequestData?.difficulty}
							acceptChallenge={onAcceptChallenge}
							rejectChallenge={onRejectChallenge}
						></ChallengeRequest>
					</DialogContent>
				</Dialog>
			</>
		</BattleSocketContext.Provider>
	);
};
