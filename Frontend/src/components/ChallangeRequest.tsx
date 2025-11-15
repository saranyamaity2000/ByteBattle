import type React from "react";
import { Button } from "./ui/button";

export const ChallangeRequest: React.FC<{
	challangedBy: string;
	challengeId: string;
	acceptChallenge: () => void;
	rejectChallenge: () => void;
}> = ({ challangedBy, challengeId, acceptChallenge, rejectChallenge }) => {
	return (
		<div className="flex flex-col items-center justify-center">
			<h2 className="text-gray-600 font-bold text-2xl mb-4">1 V 1 Coding Challange</h2>
			<div>
				<p className="text-gray-600">
					<span className="font-bold">Challange Id:</span> {challengeId}
				</p>
				<p className="text-gray-600">
					<span className="font-bold">Challanged By:</span> {challangedBy}
				</p>
			</div>
			<div className="flex mt-4 justify-center space-x-4">
				<Button
					onClick={acceptChallenge}
					className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
				>
					Accept
				</Button>
				<Button
					onClick={rejectChallenge}
					className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
				>
					Reject
				</Button>
			</div>
		</div>
	);
};
