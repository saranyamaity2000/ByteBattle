import { useState, useCallback, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useProblem } from "../hooks/useProblems";
import ResizablePane from "../components/ResizablePane";
import LightCodeEditor from "../components/LightCodeEditor";
import EvaluationResult from "../components/EvaluationResult";
import Loader from "../components/Loader";
import { Button } from "../components/ui/button";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import type { TestCase } from "../components/TestCaseInput";
import {
	submissionService,
	VerdictEnum,
	type SubmissionResult,
	type SupportedLanguage,
} from "../services/submissionService";
import { challengeService } from "../services/challengeService";
import { usePageLoaderContext } from "@/hooks/context-hooks/usePageLoaderContext";
export default function Problem() {
	const { problemSlug } = useParams<{ problemSlug: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const challengeId = searchParams.get("challengeId"); // Get challengeId from URL if present
	const { problem, isLoading, error } = useProblem(problemSlug);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [evaluationResult, setEvaluationResult] = useState<SubmissionResult | null>(null);
	const [showResult, setShowResult] = useState(false);
	const { setIsPageLoading } = usePageLoaderContext();

	useEffect(() => {
		const validateChallenge = async () => {
			if (!challengeId || !problem) return;
			try {
				setIsPageLoading(true);
				const challenge = await challengeService.getChallengeById(challengeId);
				if (challenge?.problemId !== problem.id) {
					navigate(`/problem/${problemSlug}`, { replace: true }); // completely replace history
				}
			} catch (err) {
				console.error("Failed to validate challenge:", err);
				navigate(`/problem/${problemSlug}`, { replace: true });
			} finally {
				setIsPageLoading(false);
			}
		};

		validateChallenge();
	}, [challengeId, problem, problemSlug, navigate, setIsPageLoading]);

	// Map language to backend format
	const mapLanguage = (lang: string): SupportedLanguage => {
		if (lang === "cpp") return "c++";
		if (lang === "python") return "python3";
		return "c++"; // default
	};

	const handleRunCode = useCallback(
		async (_code: string, _language: string, _testCases: TestCase[]) => {
			// TODO: Implement run code functionality
			// This would run code against custom test cases provided by user
			setIsRunning(true);

			// Placeholder for future implementation
			console.log("Run Code - TODO: Not yet implemented", {
				code: _code,
				language: _language,
				testCases: _testCases,
			});

			// Simulate delay
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setIsRunning(false);

			alert(
				"Run Code feature is coming soon! For now, use Submit to test against all test cases."
			);
		},
		[]
	);

	const handleSubmit = useCallback(
		async (code: string, language: string) => {
			if (!problemSlug) {
				console.error("Problem ID is missing");
				return;
			}

			try {
				setIsSubmitting(true);
				setShowResult(false);

				// Submit code to backend
				const submission = await submissionService.submitCode({
					problemId: problemSlug,
					lang: mapLanguage(language),
					code,
					...(challengeId && { challengeId }), // Include challengeId if present
				});

				console.log("Submission created:", submission.id);

				// Poll for result
				const finalSubmission = await submissionService.pollSubmissionStatus(
					submission.id,
					30, // max 30 attempts
					2000 // poll every 2 seconds
				);

				// Map result to UI format
				const result = finalSubmission.result;
				if (result) {
					setEvaluationResult(result);
					setShowResult(true);
				} else {
					throw new Error("No result received from evaluation");
				}
			} catch (error) {
				console.error("Submission error:", error);
				setEvaluationResult({
					verdict: VerdictEnum.FailedToSubmit,
					error:
						error instanceof Error
							? error.message
							: "Failed to submit code. Please try again.",
				});
				setShowResult(true);
			} finally {
				setIsSubmitting(false);
			}
		},
		[problemSlug, challengeId]
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
			onRunCode={handleRunCode}
			onSubmit={handleSubmit}
			isRunning={isRunning}
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
