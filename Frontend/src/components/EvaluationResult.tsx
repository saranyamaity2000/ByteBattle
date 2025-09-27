import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface EvaluationResultProps {
	isOpen: boolean;
	onClose: () => void;
	result: {
		status: "accepted" | "wrong-answer" | "time-limit-exceeded" | "runtime-error";
		message: string;
		testsPassed?: number;
		totalTests?: number;
		executionTime?: string;
	} | null;
}

export default function EvaluationResult({ isOpen, onClose, result }: EvaluationResultProps) {
	if (!result) return null;

	const getStatusIcon = () => {
		switch (result.status) {
			case "accepted":
				return <CheckCircle className="h-12 w-12 text-green-500" />;
			case "wrong-answer":
				return <XCircle className="h-12 w-12 text-red-500" />;
			case "time-limit-exceeded":
				return <Clock className="h-12 w-12 text-orange-500" />;
			case "runtime-error":
				return <AlertCircle className="h-12 w-12 text-red-500" />;
			default:
				return <XCircle className="h-12 w-12 text-gray-500" />;
		}
	};

	const getStatusColor = () => {
		switch (result.status) {
			case "accepted":
				return "text-green-600";
			case "wrong-answer":
				return "text-red-600";
			case "time-limit-exceeded":
				return "text-orange-600";
			case "runtime-error":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getStatusTitle = () => {
		switch (result.status) {
			case "accepted":
				return "Accepted!";
			case "wrong-answer":
				return "Wrong Answer";
			case "time-limit-exceeded":
				return "Time Limit Exceeded";
			case "runtime-error":
				return "Runtime Error";
			default:
				return "Unknown Error";
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={() => onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex flex-col items-center space-y-4">
						{getStatusIcon()}
						<DialogTitle className={`text-2xl font-bold ${getStatusColor()}`}>
							{getStatusTitle()}
						</DialogTitle>
					</div>
				</DialogHeader>

				<div className="space-y-4 text-center">
					<DialogDescription className="text-lg">{result.message}</DialogDescription>

					{result.testsPassed !== undefined && result.totalTests !== undefined && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-sm text-gray-600">
								Tests Passed: {result.testsPassed}/{result.totalTests}
							</p>
						</div>
					)}

					{result.executionTime && (
						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-sm text-gray-600">
								Execution Time: {result.executionTime}
							</p>
						</div>
					)}
				</div>

				<div className="flex justify-center pt-4">
					<Button onClick={onClose} className="px-8">
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
