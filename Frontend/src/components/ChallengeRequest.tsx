import type React from "react";
import { Button } from "./ui/button";
import { Clock, Target } from "lucide-react";

export const ChallengeRequest: React.FC<{
	challengeReqData: {
		challengedBy: string;
		challengeId: string;
		timeLimitInMin?: number;
		difficulty?: string;
	};
	acceptChallenge: () => void;
	rejectChallenge: () => void;
}> = ({ challengeReqData, acceptChallenge, rejectChallenge }) => {
	return (
		<div className="flex flex-col items-center justify-center p-4">
			<h2 className="text-gray-800 font-bold text-2xl mb-6">1 V 1 Coding Challenge</h2>
			<div className="space-y-3 mb-6 w-full">
				<div className="bg-gray-50 p-4 rounded-lg">
					<p className="text-gray-600">
						<span className="font-bold">Challenge ID:</span>{" "}
						{challengeReqData.challengeId}
					</p>
					<p className="text-gray-600">
						<span className="font-bold">Challenged By:</span>{" "}
						{challengeReqData.challengedBy}
					</p>
					{challengeReqData.timeLimitInMin && (
						<p className="text-gray-600 flex items-center gap-2">
							<Clock className="w-4 h-4" />
							<span className="font-bold">Time Limit:</span>{" "}
							{challengeReqData.timeLimitInMin} minutes
						</p>
					)}
					{challengeReqData.difficulty && (
						<p className="text-gray-600 flex items-center gap-2">
							<Target className="w-4 h-4" />
							<span className="font-bold">Difficulty:</span>
							<span
								className={`capitalize font-semibold ${
									challengeReqData.difficulty === "easy"
										? "text-green-600"
										: challengeReqData.difficulty === "medium"
										? "text-yellow-600"
										: "text-red-600"
								}`}
							>
								{challengeReqData.difficulty}
							</span>
						</p>
					)}
				</div>
			</div>
			<div className="flex justify-center space-x-4 w-full">
				<Button
					onClick={acceptChallenge}
					className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md flex-1 max-w-[150px]"
				>
					Accept
				</Button>
				<Button
					onClick={rejectChallenge}
					className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-md flex-1 max-w-[150px]"
				>
					Reject
				</Button>
			</div>
		</div>
	);
};
