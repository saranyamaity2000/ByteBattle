import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { problemService } from "@/services/problemService";
import type { ApiProblem } from "@/services/problemService";

export default function ModifyProblem() {
	const { problemSlug } = useParams<{ problemSlug: string }>();
	const [problem, setProblem] = useState<ApiProblem | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modifySection, setModifySection] = useState(true);
	const [testcaseSection, setTestcaseSection] = useState(true);

	useEffect(() => {
		const fetchProblem = async () => {
			if (!problemSlug) return;

			try {
				setLoading(true);
				const data = await problemService.getProblemById(problemSlug);
				if (data) {
					setProblem(data);
				} else {
					setError("Problem not found");
				}
			} catch (err) {
				const error = err as { message?: string };
				setError(error.message || "Failed to fetch problem");
			} finally {
				setLoading(false);
			}
		};

		fetchProblem();
	}, [problemSlug]);

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (error || !problem) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error || "Problem not found"}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
			<p className="text-gray-600 mb-6">Slug: {problem.slug}</p>

			{/* Modify Problem Section */}
			<div className="mb-6 border border-gray-300 rounded-lg">
				<button
					onClick={() => setModifySection(!modifySection)}
					className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-semibold flex justify-between items-center rounded-t-lg"
				>
					<span>Modify Problem</span>
					<span>{modifySection ? "▼" : "▶"}</span>
				</button>
				{modifySection && (
					<div className="p-6 space-y-4">
						<div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
							<p className="font-semibold mb-2">Coming Soon!</p>
							<p className="text-sm">
								This section will allow you to modify the problem details including
								title, statement, difficulty, examples, constraints, and tags.
							</p>
						</div>

						{/* Display current problem data */}
						<div className="space-y-3 text-sm">
							<div>
								<span className="font-medium">Title:</span> {problem.title}
							</div>
							<div>
								<span className="font-medium">Difficulty:</span>{" "}
								<span className="capitalize">{problem.difficulty}</span>
							</div>
							<div>
								<span className="font-medium">Statement:</span>
								<p className="mt-1 text-gray-700">{problem.statement}</p>
							</div>
							<div>
								<span className="font-medium">Time Limit:</span>{" "}
								{problem.timeLimitMs}ms
							</div>
							<div>
								<span className="font-medium">Memory Limit:</span>{" "}
								{problem.memoryLimitKb}KB
							</div>
							<div>
								<span className="font-medium">Premium:</span>{" "}
								{problem.isPremium ? "Yes" : "No"}
							</div>
							<div>
								<span className="font-medium">Published:</span>{" "}
								{problem.isPublished ? "Yes" : "No"}
							</div>
							{problem.topicTags && problem.topicTags.length > 0 && (
								<div>
									<span className="font-medium">Topic Tags:</span>
									<div className="flex flex-wrap gap-2 mt-1">
										{problem.topicTags.map((tag, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
							{problem.companyTags && problem.companyTags.length > 0 && (
								<div>
									<span className="font-medium">Company Tags:</span>
									<div className="flex flex-wrap gap-2 mt-1">
										{problem.companyTags.map((tag, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Add/Modify Testcase Section */}
			<div className="mb-6 border border-gray-300 rounded-lg">
				<button
					onClick={() => setTestcaseSection(!testcaseSection)}
					className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-semibold flex justify-between items-center rounded-t-lg"
				>
					<span>Add/Modify Testcases</span>
					<span>{testcaseSection ? "▼" : "▶"}</span>
				</button>
				{testcaseSection && (
					<div className="p-6">
						<div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
							<p className="font-semibold mb-2">Coming Soon!</p>
							<p className="text-sm">
								This section will allow you to add and modify test cases for the
								problem. You'll be able to upload testcase files or input them
								directly.
							</p>
						</div>

						{problem.testcaseUrl && (
							<div className="mt-4 p-3 bg-gray-50 rounded">
								<span className="font-medium text-sm">Current Testcase URL:</span>
								<p className="text-sm text-gray-700 mt-1 break-all">
									{problem.testcaseUrl}
								</p>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Examples Section (Read-only for now) */}
			{problem.examples && problem.examples.length > 0 && (
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-3">Examples</h2>
					<div className="space-y-4">
						{problem.examples.map((example, index) => (
							<div
								key={index}
								className="border border-gray-300 rounded-lg p-4 bg-gray-50"
							>
								<h3 className="font-semibold mb-2">Example {index + 1}</h3>
								<div className="space-y-2 text-sm">
									<div>
										<span className="font-medium">Input:</span>
										<pre className="mt-1 p-2 bg-white rounded border border-gray-200">
											{example.input}
										</pre>
									</div>
									<div>
										<span className="font-medium">Output:</span>
										<pre className="mt-1 p-2 bg-white rounded border border-gray-200">
											{example.output}
										</pre>
									</div>
									{example.explanation && (
										<div>
											<span className="font-medium">Explanation:</span>
											<p className="mt-1 text-gray-700">
												{example.explanation}
											</p>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Constraints Section (Read-only for now) */}
			{problem.constraints && problem.constraints.length > 0 && (
				<div className="mb-6">
					<h2 className="text-xl font-semibold mb-3">Constraints</h2>
					<ul className="list-disc list-inside space-y-1 text-sm">
						{problem.constraints.map((constraint, index) => (
							<li key={index} className="text-gray-700">
								{constraint}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
