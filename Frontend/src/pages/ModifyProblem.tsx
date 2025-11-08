import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { problemService } from "@/services/problemService";
import type { ApiProblem } from "@/services/problemService";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Upload,
	Download,
	Eye,
	FileText,
	AlertCircle,
	CheckCircle,
	FileDown,
	Save,
} from "lucide-react";

// Template utility for generating testcase template
const generateTestcaseTemplate = () => {
	return [
		{
			input: "test input",
			output: "test output",
		},
		{
			input: "test input2",
			output: "test output2",
		},
		{
			input: "keep adding more",
			output: "keep adding more",
		},
	];
};

// Utility to download template file
const downloadTemplate = () => {
	const template = generateTestcaseTemplate();
	const jsonString = JSON.stringify(template, null, 2);
	const blob = new Blob([jsonString], { type: "application/json" });

	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "testcase-template.json";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

// Reusable error message component with template link
const ErrorMessage = ({
	error,
	isValidationError,
}: {
	error: string;
	isValidationError: boolean;
}) => {
	if (!isValidationError) {
		return (
			<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
				<AlertCircle className="h-5 w-5" />
				{error}
			</div>
		);
	}

	return (
		<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
			<AlertCircle className="h-5 w-5" />
			<span>
				Please verify the uploaded file against the{" "}
				<button
					onClick={downloadTemplate}
					className="underline text-red-800 font-medium hover:text-red-600 cursor-pointer"
					style={{ cursor: "pointer" }}
				>
					template file
				</button>
			</span>
		</div>
	);
};

// Template download button component
const TemplateDownloadButton = () => (
	<Button
		onClick={downloadTemplate}
		variant="outline"
		size="sm"
		className="mb-4 cursor-pointer"
		style={{ cursor: "pointer !important" }}
	>
		<FileDown className="h-4 w-4 mr-2" />
		Download Template
	</Button>
);

interface Example {
	input: string;
	output: string;
	explanation?: string;
}

interface ProblemFormData {
	title: string;
	slug: string;
	statement: string;
	difficulty: "easy" | "medium" | "hard";
	examples: Example[];
	constraints: string[];
	timeLimitMs: number;
	memoryLimitKb: number;
	author: string;
	isPremium: boolean;
	editorial: string;
	topicTags: string[];
	companyTags: string[];
}

export default function ModifyProblem() {
	const { problemSlug } = useParams<{ problemSlug: string }>();
	const [problem, setProblem] = useState<ApiProblem | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [uploadingTestcase, setUploadingTestcase] = useState(false);
	const [downloadingTestcase, setDownloadingTestcase] = useState(false);
	const [publishing, setPublishing] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
	const [isValidationError, setIsValidationError] = useState(false);
	const [savingProblem, setSavingProblem] = useState(false);
	const [formData, setFormData] = useState<ProblemFormData | null>(null);

	useEffect(() => {
		const fetchProblem = async () => {
			if (!problemSlug) return;

			try {
				setLoading(true);
				const data = await problemService.getProblemById(problemSlug);
				if (data) {
					setProblem(data);
					// Initialize form data
					setFormData({
						title: data.title,
						slug: data.slug,
						statement: data.statement,
						difficulty: data.difficulty,
						examples: data.examples,
						constraints: data.constraints,
						timeLimitMs: data.timeLimitMs,
						memoryLimitKb: data.memoryLimitKB,
						author: data.author,
						isPremium: data.isPremium,
						editorial: data.editorial,
						topicTags: data.topicTags,
						companyTags: data.companyTags,
					});
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

	const handleInputChange = (field: keyof ProblemFormData, value: string | number | boolean) => {
		if (!formData) return;
		setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
	};

	const handleExampleChange = (index: number, field: keyof Example, value: string) => {
		if (!formData) return;
		const newExamples = [...formData.examples];
		newExamples[index] = { ...newExamples[index], [field]: value };
		setFormData((prev) => (prev ? { ...prev, examples: newExamples } : null));
	};

	const addExample = () => {
		if (!formData) return;
		setFormData((prev) =>
			prev
				? {
						...prev,
						examples: [...prev.examples, { input: "", output: "", explanation: "" }],
				  }
				: null
		);
	};

	const removeExample = (index: number) => {
		if (!formData || formData.examples.length <= 1) return;
		setFormData((prev) =>
			prev
				? {
						...prev,
						examples: prev.examples.filter((_, i) => i !== index),
				  }
				: null
		);
	};

	const handleArrayChange = (
		field: "constraints" | "topicTags" | "companyTags",
		index: number,
		value: string
	) => {
		if (!formData) return;
		const newArray = [...formData[field]];
		newArray[index] = value;
		setFormData((prev) => (prev ? { ...prev, [field]: newArray } : null));
	};

	const addArrayItem = (field: "constraints" | "topicTags" | "companyTags") => {
		if (!formData) return;
		setFormData((prev) =>
			prev
				? {
						...prev,
						[field]: [...prev[field], ""],
				  }
				: null
		);
	};

	const removeArrayItem = (field: "constraints" | "topicTags" | "companyTags", index: number) => {
		if (!formData || formData[field].length <= 1) return;
		setFormData((prev) =>
			prev
				? {
						...prev,
						[field]: prev[field].filter((_, i) => i !== index),
				  }
				: null
		);
	};

	const handleSaveProblem = async () => {
		if (!problemSlug || !formData) return;

		try {
			setSavingProblem(true);
			setError(null);

			// Filter out empty strings from arrays
			const payload = {
				title: formData.title,
				statement: formData.statement,
				difficulty: formData.difficulty,
				examples: formData.examples.map((ex) => ({
					input: ex.input,
					output: ex.output,
					...(ex.explanation?.trim() && { explanation: ex.explanation }),
				})),
				constraints: formData.constraints.filter((c) => c.trim()),
				timeLimitMs: formData.timeLimitMs,
				memoryLimitKB: formData.memoryLimitKb,
				isPremium: formData.isPremium,
				topicTags: formData.topicTags.filter((t) => t.trim()),
				companyTags: formData.companyTags.filter((c) => c.trim()),
				...(formData.author?.trim() && { author: formData.author }),
				...(formData.editorial?.trim() && { editorial: formData.editorial }),
			};

			const updatedProblem = await problemService.updateProblem(problemSlug, payload);
			setProblem(updatedProblem);
			setSuccessMessage("Problem details updated successfully!");
		} catch (err) {
			const error = err as { response?: { data?: { message?: string } }; message?: string };
			setError(error.response?.data?.message || error.message || "Failed to update problem");
		} finally {
			setSavingProblem(false);
		}
	};

	const handleTestcaseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !problemSlug) return;

		// Clear any existing error and validation state as soon as user tries to upload
		setError(null);
		setIsValidationError(false);

		// Validate file type
		if (!file.name.endsWith(".json")) {
			setError("Please upload a JSON file");
			return;
		}

		// Validate file size (1MB = 1024 * 1024 bytes)
		if (file.size > 1024 * 1024) {
			setError("File size must be less than 1MB");
			return;
		}

		try {
			setUploadingTestcase(true);
			await problemService.uploadTestcase(problemSlug, file);
			setSuccessMessage("Testcase uploaded successfully!");

			// Refresh problem data to update testcase status
			const updatedProblem = await problemService.getProblemById(problemSlug);
			if (updatedProblem) {
				setProblem(updatedProblem);
			}
		} catch (err) {
			// Check if it's a 400 validation error using axios error structure
			let isValidationErr = false;
			let errorMessage = "Failed to upload testcase";

			if (axios.isAxiosError(err)) {
				if (err.response?.status === 400) {
					isValidationErr = true;
					// Override the error message for validation errors to be cleaner
					errorMessage = "Invalid testcase format detected.";
				} else {
					errorMessage = err.response?.data?.message || err.message || errorMessage;
				}
			} else if (err instanceof Error) {
				errorMessage = err.message;
			}

			setIsValidationError(isValidationErr);
			setError(errorMessage);
		} finally {
			setUploadingTestcase(false);
			// Clear file input
			event.target.value = "";
		}
	};

	const handleTestcaseDownload = async () => {
		if (!problemSlug) return;

		try {
			setDownloadingTestcase(true);
			setError(null);
			setDownloadMessage("Starting download...");

			const { blob, filename } = await problemService.downloadTestcase(problemSlug);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename || `${problemSlug}-testcases.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			setSuccessMessage("Testcase downloaded successfully!");
			setDownloadMessage(null);
		} catch (err) {
			const error = err as { message?: string };
			setError(error.message || "Failed to download testcase");
			setDownloadMessage(null);
		} finally {
			setDownloadingTestcase(false);
		}
	};

	const handlePublishProblem = async () => {
		if (!problemSlug) return;

		try {
			setPublishing(true);
			setError(null);
			const updatedProblem = await problemService.publishProblem(problemSlug);
			setProblem(updatedProblem);
			setSuccessMessage("Problem published successfully!");
		} catch (err) {
			const error = err as { message?: string };
			setError(error.message || "Failed to publish problem");
		} finally {
			setPublishing(false);
		}
	};

	// Clear success messages after 5 seconds, but keep error messages persistent
	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				setSuccessMessage(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [successMessage]);

	// Clear download message after 3 seconds
	useEffect(() => {
		if (downloadMessage) {
			const timer = setTimeout(() => {
				setDownloadMessage(null);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [downloadMessage]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading problem...</p>
				</div>
			</div>
		);
	}

	if (error && !problem) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
				<div className="text-center max-w-md">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
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
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Problem not found</h2>
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Header */}
				<div className="flex items-center mb-8">
					<Link to="/problems">
						<Button variant="ghost" className="mr-4 cursor-pointer">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Problems
						</Button>
					</Link>
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
						<div className="flex items-center gap-4 mt-2">
							<p className="text-gray-600">Slug: {problem.slug}</p>
							<div className="flex items-center gap-2">
								{problem.isPublished ? (
									<>
										<Eye className="h-4 w-4 text-green-600" />
										<span className="text-sm text-green-600 font-medium">
											Published
										</span>
									</>
								) : (
									<>
										<AlertCircle className="h-4 w-4 text-orange-600" />
										<span className="text-sm text-orange-600 font-medium">
											Unpublished
										</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Messages */}
				{downloadMessage && (
					<div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center gap-2">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
						{downloadMessage}
					</div>
				)}

				{successMessage && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
						<CheckCircle className="h-5 w-5" />
						{successMessage}
					</div>
				)}

				{error && <ErrorMessage error={error} isValidationError={isValidationError} />}

				{/* Problem Details Section */}
				{formData && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold text-gray-900">Problem Details</h2>
							<Button
								onClick={handleSaveProblem}
								disabled={savingProblem}
								className="cursor-pointer"
							>
								<Save className="h-4 w-4 mr-2" />
								{savingProblem ? "Saving..." : "Save Changes"}
							</Button>
						</div>

						<div className="space-y-6">
							{/* Title - Disabled */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Title <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={formData.title}
									disabled
									className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
								/>
							</div>

							{/* Slug - Disabled */}
							<div>
								<label className="block text-sm font-medium mb-2">Slug</label>
								<input
									type="text"
									value={formData.slug}
									disabled
									className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
								/>
							</div>

							{/* Statement - Editable */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Problem Statement <span className="text-red-500">*</span>
								</label>
								<textarea
									value={formData.statement}
									onChange={(e) => handleInputChange("statement", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
									placeholder="Describe the problem..."
								/>
							</div>

							{/* Difficulty - Editable */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Difficulty <span className="text-red-500">*</span>
								</label>
								<select
									value={formData.difficulty}
									onChange={(e) =>
										handleInputChange(
											"difficulty",
											e.target.value as "easy" | "medium" | "hard"
										)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="easy">Easy</option>
									<option value="medium">Medium</option>
									<option value="hard">Hard</option>
								</select>
							</div>

							{/* Examples - Editable */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Examples <span className="text-red-500">*</span>
								</label>
								{formData.examples.map((example, index) => (
									<div
										key={index}
										className="border border-gray-300 rounded-md p-4 mb-3 bg-gray-50"
									>
										<div className="flex justify-between items-center mb-3">
											<h4 className="font-medium">Example {index + 1}</h4>
											{formData.examples.length > 1 && (
												<Button
													type="button"
													variant="destructive"
													size="sm"
													onClick={() => removeExample(index)}
												>
													Remove
												</Button>
											)}
										</div>
										<div className="space-y-3">
											<div>
												<label className="block text-xs font-medium mb-1">
													Input
												</label>
												<textarea
													value={example.input}
													onChange={(e) =>
														handleExampleChange(
															index,
															"input",
															e.target.value
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													placeholder="e.g., nums = [2,7,11,15], target = 9"
													rows={2}
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Output
												</label>
												<textarea
													value={example.output}
													onChange={(e) =>
														handleExampleChange(
															index,
															"output",
															e.target.value
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													placeholder="e.g., [0,1]"
													rows={2}
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Explanation (optional)
												</label>
												<textarea
													value={example.explanation || ""}
													onChange={(e) =>
														handleExampleChange(
															index,
															"explanation",
															e.target.value
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													placeholder="Explain the example..."
													rows={2}
												/>
											</div>
										</div>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={addExample}
									className="mt-2"
								>
									+ Add Example
								</Button>
							</div>

							{/* Constraints - Editable */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Constraints
								</label>
								{formData.constraints.map((constraint, index) => (
									<div key={index} className="flex gap-2 mb-2">
										<input
											type="text"
											value={constraint}
											onChange={(e) =>
												handleArrayChange(
													"constraints",
													index,
													e.target.value
												)
											}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g., 2 <= nums.length <= 10^4"
										/>
										{formData.constraints.length > 1 && (
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() =>
													removeArrayItem("constraints", index)
												}
											>
												Remove
											</Button>
										)}
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() => addArrayItem("constraints")}
									className="mt-2"
								>
									+ Add Constraint
								</Button>
							</div>

							{/* Time and Memory Limits - Editable */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-2">
										Time Limit (ms)
									</label>
									<input
										type="number"
										value={formData.timeLimitMs}
										onChange={(e) =>
											handleInputChange(
												"timeLimitMs",
												parseInt(e.target.value) || 1000
											)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										min="1"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">
										Memory Limit (KB)
									</label>
									<input
										type="number"
										value={formData.memoryLimitKb}
										onChange={(e) =>
											handleInputChange(
												"memoryLimitKb",
												parseInt(e.target.value) || 65536
											)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										min="1"
									/>
								</div>
							</div>

							{/* Premium - Editable */}
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="isPremium"
									checked={formData.isPremium}
									onChange={(e) =>
										handleInputChange("isPremium", e.target.checked)
									}
									className="w-4 h-4"
								/>
								<label htmlFor="isPremium" className="text-sm font-medium">
									Premium Problem
								</label>
							</div>

							{/* Editorial - Editable */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Editorial (optional)
								</label>
								<textarea
									value={formData.editorial}
									onChange={(e) => handleInputChange("editorial", e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
									placeholder="Provide hints or solutions..."
								/>
							</div>

							{/* Topic Tags - Editable */}
							<div>
								<label className="block text-sm font-medium mb-2">Topic Tags</label>
								{formData.topicTags.map((tag, index) => (
									<div key={index} className="flex gap-2 mb-2">
										<input
											type="text"
											value={tag}
											onChange={(e) =>
												handleArrayChange(
													"topicTags",
													index,
													e.target.value
												)
											}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g., Array, Hash Table"
										/>
										{formData.topicTags.length > 1 && (
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => removeArrayItem("topicTags", index)}
											>
												Remove
											</Button>
										)}
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() => addArrayItem("topicTags")}
									className="mt-2"
								>
									+ Add Topic Tag
								</Button>
							</div>

							{/* Company Tags - Editable */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Company Tags
								</label>
								{formData.companyTags.map((tag, index) => (
									<div key={index} className="flex gap-2 mb-2">
										<input
											type="text"
											value={tag}
											onChange={(e) =>
												handleArrayChange(
													"companyTags",
													index,
													e.target.value
												)
											}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="e.g., Amazon, Google"
										/>
										{formData.companyTags.length > 1 && (
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() =>
													removeArrayItem("companyTags", index)
												}
											>
												Remove
											</Button>
										)}
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() => addArrayItem("companyTags")}
									className="mt-2"
								>
									+ Add Company Tag
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Testcase Management Section */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Testcase Management
					</h2>

					<div className="space-y-4">
						{/* Template download button */}
						<div className="flex justify-end">
							<TemplateDownloadButton />
						</div>

						{/* Current testcase status */}
						{problem.testcaseUrl ? (
							<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
								<p className="text-sm text-green-700 mb-3">
									<CheckCircle className="h-4 w-4 inline mr-1" />
									Testcase file is available for this problem
								</p>
								<Button
									onClick={handleTestcaseDownload}
									disabled={downloadingTestcase}
									variant="outline"
									size="sm"
									className="mr-3 cursor-pointer"
								>
									<Download className="h-4 w-4 mr-2" />
									{downloadingTestcase ? "Downloading..." : "Download Testcase"}
								</Button>
							</div>
						) : (
							<div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
								<p className="text-sm text-orange-700">
									<AlertCircle className="h-4 w-4 inline mr-1" />
									No testcase file found. Upload one to enable problem publishing.
								</p>
							</div>
						)}

						{/* Upload section */}
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
							<input
								type="file"
								accept=".json"
								onChange={handleTestcaseUpload}
								disabled={uploadingTestcase}
								className="hidden"
								id="testcase-upload"
							/>
							<label
								htmlFor="testcase-upload"
								className={`cursor-pointer ${
									uploadingTestcase ? "opacity-50 cursor-not-allowed" : ""
								}`}
							>
								<Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
								<p className="text-sm text-gray-600 mb-1">
									{uploadingTestcase
										? "Uploading..."
										: "Click to upload or replace testcase file"}
								</p>
								<p className="text-xs text-gray-500">JSON files only, max 1MB</p>
							</label>
						</div>
					</div>
				</div>

				{/* Publish Section */}
				<div className="flex justify-end">
					<Button
						onClick={handlePublishProblem}
						disabled={publishing || problem.isPublished || !problem.testcaseUrl}
						className="px-6 py-2 cursor-pointer"
					>
						{publishing
							? "Publishing..."
							: problem.isPublished
							? "Already Published"
							: "Publish Problem"}
					</Button>
				</div>
			</div>
		</div>
	);
}
