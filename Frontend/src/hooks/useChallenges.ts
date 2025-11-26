import { challengeService, type ApiChallenge } from "@/services/challengeService";
import { useEffect, useState } from "react";

const challengeTypeToFetcherMap: Record<"ongoing" | "past", () => Promise<ApiChallenge[]>> = {
	ongoing: challengeService.getOnGoingChallenges.bind(challengeService),
	past: challengeService.getPastChallenges.bind(challengeService),
};

export function useChallenges(type: "ongoing" | "past") {
	const [challenges, setChallenges] = useState<ApiChallenge[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async function fetchChallenges(): Promise<void> {
			try {
				setIsLoading(true);
				setError(null);
				const challenges = await challengeTypeToFetcherMap[type]();
				setChallenges(challenges);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch ongoingChallenges");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [type]);
	return [challenges, isLoading, error] as const;
}
