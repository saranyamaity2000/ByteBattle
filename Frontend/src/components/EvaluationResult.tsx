import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { VerdictEnum, type SubmissionResult } from "@/services/submissionService";

interface EvaluationResultProps {
	isOpen: boolean;
	onClose: () => void;
	result: SubmissionResult | null;
}

export default function EvaluationResult({ isOpen, onClose, result }: EvaluationResultProps) {
	if (!result) return null;

	const getStatusIcon = () => {
		switch (result.verdict) {
			case VerdictEnum.Accepted:
				return <CheckCircle className="h-12 w-12 text-green-500" />;
			case VerdictEnum.WrongAnswer:
				return <XCircle className="h-12 w-12 text-red-500" />;
			case VerdictEnum.TimeLimitExceeded:
				return <Clock className="h-12 w-12 text-orange-500" />;
			case VerdictEnum.RuntimeError:
			case VerdictEnum.CompileError:
				return <AlertCircle className="h-12 w-12 text-red-500" />;
			default:
				return <XCircle className="h-12 w-12 text-gray-500" />;
		}
	};

	const getStatusColor = () => {
		switch (result.verdict) {
			case VerdictEnum.Accepted:
				return "text-green-600";
			case VerdictEnum.WrongAnswer:
				return "text-red-600";
			case VerdictEnum.TimeLimitExceeded:
				return "text-orange-600";
			case VerdictEnum.RuntimeError:
			case VerdictEnum.CompileError:
				return "text-red-600";
			default:
				return "text-red-600";
		}
	};

	const getStatusTitle = () => {
		return result.verdict;
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
					{result.error && (
						<DialogDescription className="text-lg">{result.error}</DialogDescription>
					)}

					{result.testCasesPassed !== undefined &&
						result.totalTestCases !== undefined && (
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600">
									Tests Passed: {result.testCasesPassed}/{result.totalTestCases}
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
