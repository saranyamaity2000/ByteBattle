import { Button } from "@/components/ui/button";
import { useBattleSocketContext } from "@/hooks/context-hooks/useBattleSocketContext";
import { usePageLoaderContext } from "@/hooks/context-hooks/usePageLoaderContext";
import { useState } from "react";

export const BattlePage: React.FC = () => {
	const [opponentEmail, setOpponentEmail] = useState("");

	const { battleSocket, isSocketConnected } = useBattleSocketContext();
	const { setIsPageLoading } = usePageLoaderContext();

	const handleChallange = () => {
		battleSocket?.emit("challenge", { chanllangeToEmail: opponentEmail });
		// Show loading state until we receive match_start or challenge-rejected
		setIsPageLoading(true);
	};
	return (
		<div>
			<div className="border-2 border-gray-400 inline-block p-2 rounded-md">
				{/* Developer Info */}
				<p>Socket Connected: {isSocketConnected ? "Yes" : "No"}</p>
				<p>Socket: {battleSocket?.id ?? "N/A"}</p>
			</div>
			{isSocketConnected && (
				<div className="flex flex-col gap-2 items-center">
					<h2 className="text-2xl font-bold text-blue-800">Challenge a user!</h2>
					<input
						className="border-1 border-gray-300 rounded-sm p-2"
						type="email"
						name="email"
						placeholder="User email"
						value={opponentEmail}
						onChange={(e) => setOpponentEmail(e.target.value)}
					/>
					<Button
						variant="glowingBorder"
						size="lg"
						onClick={handleChallange}
						disabled={!opponentEmail}
					>
						Challenge
					</Button>
				</div>
			)}
		</div>
	);
};
