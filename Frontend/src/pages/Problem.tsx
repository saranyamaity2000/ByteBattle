import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useProblem } from "../hooks/useProblems";
import ResizablePane from "../components/ResizablePane";
import LightCodeEditor from "../components/LightCodeEditor";
import EvaluationResult from "../components/EvaluationResult";
import Loader from "../components/Loader";
import { Button } from "../components/ui/button";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export default function Problem() {
	const { problemId } = useParams<{ problemId: string }>();
	const { problem, isLoading, error } = useProblem(problemId);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [evaluationResult, setEvaluationResult] = useState<{
		status: "accepted" | "wrong-answer" | "time-limit-exceeded" | "runtime-error";
		message: string;
		testsPassed?: number;
		totalTests?: number;
		executionTime?: string;
	} | null>(null);
	const [showResult, setShowResult] = useState(false);

	const handleSubmit = useCallback(
		async (code: string, language: string) => {
			console.log("Submitting code:", { code, language, problemId });

			setIsSubmitting(true);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Mock evaluation result
			const mockResults = [
				{
					status: "accepted" as const,
					message: "Congratulations! Your solution is correct.",
					testsPassed: 15,
					totalTests: 15,
					executionTime: "45ms",
				},
				{
					status: "wrong-answer" as const,
					message: "Your solution failed some test cases.",
					testsPassed: 12,
					totalTests: 15,
					executionTime: "32ms",
				},
				{
					status: "time-limit-exceeded" as const,
					message: "Your solution exceeded the time limit.",
					testsPassed: 8,
					totalTests: 15,
					executionTime: "> 2000ms",
				},
				{
					status: "runtime-error" as const,
					message: "Your solution encountered a runtime error.",
					testsPassed: 0,
					totalTests: 15,
					executionTime: "N/A",
				},
			];

			const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
			setEvaluationResult(randomResult);
			setIsSubmitting(false);
			setShowResult(true);
		},
		[problemId]
	);

	const handleCloseResult = useCallback(() => {
		setShowResult(false);
		setEvaluationResult(null);
	}, []);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading problem...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center max-w-md">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Problem</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<Link to="/problems">
						<Button>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Problems
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (!problem) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Problem Not Found</h2>
					<p className="text-gray-600 mb-6">
						The problem you're looking for doesn't exist.
					</p>
					<Link to="/problems">
						<Button>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Problems
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Check if problem is not published
	if (!problem.isPublished) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
				<div className="text-center max-w-md">
					<div className="mb-6">
						<div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
							<AlertCircle className="h-8 w-8 text-orange-600" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Problem Yet to be Published
						</h2>
						<p className="text-gray-600 text-sm leading-relaxed">
							This problem is currently under review and hasn't been published yet.
							Please check back later or contact the administrator.
						</p>
					</div>
					<Link to="/problems" className="inline-block">
						<Button variant="outline" className="flex items-center gap-2 mx-auto">
							<ArrowLeft className="h-4 w-4" />
							Back to Problems
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	const getDifficultyColor = () => {
		switch (problem.difficulty) {
			case "Easy":
				return "text-green-600 bg-green-100 border-green-200";
			case "Medium":
				return "text-yellow-600 bg-yellow-100 border-yellow-200";
			case "Hard":
				return "text-red-600 bg-red-100 border-red-200";
			default:
				return "text-gray-600 bg-gray-100 border-gray-200";
		}
	};

	const getDifficultyIcon = () => {
		switch (problem.difficulty) {
			case "Easy":
				return <CheckCircle className="h-4 w-4" />;
			case "Medium":
				return <Clock className="h-4 w-4" />;
			case "Hard":
				return <XCircle className="h-4 w-4" />;
			default:
				return null;
		}
	};

	// Problem Description Panel
	const leftPane = (
		<div className="h-full overflow-y-auto bg-white">
			{/* Header */}
			<div className="sticky top-0 bg-white border-b border-gray-200 p-4">
				<Link to="/problems">
					<Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Problems
					</Button>
				</Link>

				<div className="flex items-center gap-3 mb-2">
					<h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
					<span
						className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor()}`}
					>
						{getDifficultyIcon()}
						{problem.difficulty}
					</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
						{problem.category}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="p-6 space-y-6">
				{/* Description */}
				<div>
					<h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
					<div className="prose prose-sm max-w-none text-gray-700">
						{problem.description.split("\n").map((paragraph, index) => (
							<p key={index} className="mb-3 leading-relaxed">
								{paragraph}
							</p>
						))}
					</div>
				</div>

				{/* Examples */}
				{problem.examples.length > 0 ? (
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-3">Examples</h2>
						<div className="space-y-4">
							{problem.examples.map((example, index) => (
								<div
									key={index}
									className="border border-gray-200 rounded-lg p-4 bg-gray-50"
								>
									<h3 className="font-medium text-gray-900 mb-2">
										Example {index + 1}:
									</h3>
									<div className="space-y-2 text-sm">
										<div>
											<strong className="text-gray-700">Input:</strong>
											<code className="ml-2 px-2 py-1 bg-gray-200 rounded font-mono">
												{example.input}
											</code>
										</div>
										<div>
											<strong className="text-gray-700">Output:</strong>
											<code className="ml-2 px-2 py-1 bg-gray-200 rounded font-mono">
												{example.output}
											</code>
										</div>
										{example.explanation && (
											<div className="text-gray-600">
												<strong>Explanation:</strong> {example.explanation}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-3">Examples</h2>
						<div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
							<p className="text-gray-600 text-sm">
								No examples provided for this problem. Use the constraints and
								description to understand the requirements.
							</p>
						</div>
					</div>
				)}

				{/* Constraints */}
				<div>
					<h2 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h2>
					<ul className="space-y-1">
						{problem.constraints.map((constraint, index) => (
							<li key={index} className="flex items-start">
								<span className="text-gray-400 mr-2">•</span>
								<code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
									{constraint}
								</code>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);

	// Code Editor Panel
	const rightPane = (
		<LightCodeEditor
			initialCode={problem.starterCode}
			onSubmit={handleSubmit}
			isSubmitting={isSubmitting}
		/>
	);

	return (
		<div className="h-screen flex flex-col bg-gray-100">
			{/* Main Content */}
			<div className="flex-1 overflow-hidden">
				<ResizablePane
					leftPane={leftPane}
					rightPane={rightPane}
					defaultWidth={45}
					minWidth={25}
					maxWidth={75}
				/>
			</div>

			{/* Loader */}
			{isSubmitting && <Loader />}

			{/* Evaluation Result Dialog */}
			<EvaluationResult
				isOpen={showResult}
				onClose={handleCloseResult}
				result={evaluationResult}
			/>
		</div>
	);
}
