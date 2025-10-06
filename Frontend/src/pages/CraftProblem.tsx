import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { problemService } from "@/services/problemService";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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

export default function CraftProblem() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [showErrorModal, setShowErrorModal] = useState(false);

	const [formData, setFormData] = useState<ProblemFormData>({
		title: "",
		slug: "",
		statement: "",
		difficulty: "easy",
		examples: [{ input: "", output: "", explanation: "" }],
		constraints: [""],
		timeLimitMs: 1000,
		memoryLimitKb: 65536,
		author: "",
		isPremium: false,
		editorial: "",
		topicTags: [""],
		companyTags: [""],
	});

	const handleInputChange = (field: keyof ProblemFormData, value: string | number | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleExampleChange = (index: number, field: keyof Example, value: string) => {
		const newExamples = [...formData.examples];
		newExamples[index] = { ...newExamples[index], [field]: value };
		setFormData((prev) => ({ ...prev, examples: newExamples }));
	};

	const addExample = () => {
		setFormData((prev) => ({
			...prev,
			examples: [...prev.examples, { input: "", output: "", explanation: "" }],
		}));
	};

	const removeExample = (index: number) => {
		if (formData.examples.length > 1) {
			setFormData((prev) => ({
				...prev,
				examples: prev.examples.filter((_, i) => i !== index),
			}));
		}
	};

	const handleArrayChange = (
		field: "constraints" | "topicTags" | "companyTags",
		index: number,
		value: string
	) => {
		const newArray = [...formData[field]];
		newArray[index] = value;
		setFormData((prev) => ({ ...prev, [field]: newArray }));
	};

	const addArrayItem = (field: "constraints" | "topicTags" | "companyTags") => {
		setFormData((prev) => ({
			...prev,
			[field]: [...prev[field], ""],
		}));
	};

	const removeArrayItem = (field: "constraints" | "topicTags" | "companyTags", index: number) => {
		if (formData[field].length > 1) {
			setFormData((prev) => ({
				...prev,
				[field]: prev[field].filter((_, i) => i !== index),
			}));
		}
	};

	const validateForm = (): boolean => {
		const errors: string[] = [];

		if (!formData.title.trim()) {
			errors.push("Title is required");
		}
		if (!formData.statement.trim()) {
			errors.push("Problem statement is required");
		}

		// Validate examples
		formData.examples.forEach((ex, index) => {
			if (!ex.input.trim()) {
				errors.push(`Example ${index + 1}: Input is required`);
			}
			if (!ex.output.trim()) {
				errors.push(`Example ${index + 1}: Output is required`);
			}
		});

		if (errors.length > 0) {
			setValidationErrors(errors);
			setShowErrorModal(true);
			setError(errors[0]); // Keep the first error at the top too
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			// Filter out empty strings from arrays
			const payload = {
				...formData,
				examples: formData.examples.map((ex) => ({
					input: ex.input,
					output: ex.output,
					...(ex.explanation?.trim() && { explanation: ex.explanation }),
				})),
				constraints: formData.constraints.filter((c) => c.trim()),
				topicTags: formData.topicTags.filter((t) => t.trim()),
				companyTags: formData.companyTags.filter((c) => c.trim()),
				...(formData.slug.trim() && { slug: formData.slug }),
				...(formData.author.trim() && { author: formData.author }),
				...(formData.editorial.trim() && { editorial: formData.editorial }),
			};

			const result = await problemService.createProblem(payload);

			// Redirect to modify page
			navigate(`/problem/modify/${result.slug}`);
		} catch (err) {
			const error = err as { response?: { data?: { message?: string } }; message?: string };
			setError(error.response?.data?.message || error.message || "Failed to create problem");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<h1 className="text-3xl font-bold mb-6">Craft a New Problem</h1>

			{/* Validation Error Modal */}
			<Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-red-600">Validation Errors</DialogTitle>
						<DialogDescription>
							Please fix the following errors before submitting:
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<ul className="list-disc list-inside space-y-2 text-sm text-red-600">
							{validationErrors.map((error, index) => (
								<li key={index} className="leading-relaxed">
									{error}
								</li>
							))}
						</ul>
					</div>
					<div className="flex justify-end mt-4">
						<Button onClick={() => setShowErrorModal(false)}>Got it</Button>
					</div>
				</DialogContent>
			</Dialog>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Title */}
				<div>
					<label className="block text-sm font-medium mb-2">
						Title <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						value={formData.title}
						onChange={(e) => handleInputChange("title", e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="e.g., Two Sum"
					/>
				</div>

				{/* Slug */}
				<div>
					<label className="block text-sm font-medium mb-2">Slug (optional)</label>
					<input
						type="text"
						value={formData.slug}
						onChange={(e) => handleInputChange("slug", e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="e.g., two-sum (auto-generated if empty)"
					/>
				</div>

				{/* Statement */}
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

				{/* Difficulty */}
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

				{/* Examples */}
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
									<label className="block text-xs font-medium mb-1">Input</label>
									<textarea
										value={example.input}
										onChange={(e) =>
											handleExampleChange(index, "input", e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="e.g., nums = [2,7,11,15], target = 9"
										rows={2}
									/>
								</div>
								<div>
									<label className="block text-xs font-medium mb-1">Output</label>
									<textarea
										value={example.output}
										onChange={(e) =>
											handleExampleChange(index, "output", e.target.value)
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
					<Button type="button" variant="outline" onClick={addExample} className="mt-2">
						+ Add Example
					</Button>
				</div>

				{/* Constraints */}
				<div>
					<label className="block text-sm font-medium mb-2">Constraints</label>
					{formData.constraints.map((constraint, index) => (
						<div key={index} className="flex gap-2 mb-2">
							<input
								type="text"
								value={constraint}
								onChange={(e) =>
									handleArrayChange("constraints", index, e.target.value)
								}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., 2 <= nums.length <= 10^4"
							/>
							{formData.constraints.length > 1 && (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={() => removeArrayItem("constraints", index)}
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

				{/* Time and Memory Limits */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium mb-2">Time Limit (ms)</label>
						<input
							type="number"
							value={formData.timeLimitMs}
							onChange={(e) =>
								handleInputChange("timeLimitMs", parseInt(e.target.value) || 1000)
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							min="1"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Memory Limit (KB)</label>
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

				{/* Author */}
				<div>
					<label className="block text-sm font-medium mb-2">Author (optional)</label>
					<input
						type="text"
						value={formData.author}
						onChange={(e) => handleInputChange("author", e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Your name"
					/>
				</div>

				{/* Premium */}
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="isPremium"
						checked={formData.isPremium}
						onChange={(e) => handleInputChange("isPremium", e.target.checked)}
						className="w-4 h-4"
					/>
					<label htmlFor="isPremium" className="text-sm font-medium">
						Premium Problem
					</label>
				</div>

				{/* Editorial */}
				<div>
					<label className="block text-sm font-medium mb-2">Editorial (optional)</label>
					<textarea
						value={formData.editorial}
						onChange={(e) => handleInputChange("editorial", e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
						placeholder="Provide hints or solutions..."
					/>
				</div>

				{/* Topic Tags */}
				<div>
					<label className="block text-sm font-medium mb-2">Topic Tags</label>
					{formData.topicTags.map((tag, index) => (
						<div key={index} className="flex gap-2 mb-2">
							<input
								type="text"
								value={tag}
								onChange={(e) =>
									handleArrayChange("topicTags", index, e.target.value)
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

				{/* Company Tags */}
				<div>
					<label className="block text-sm font-medium mb-2">Company Tags</label>
					{formData.companyTags.map((tag, index) => (
						<div key={index} className="flex gap-2 mb-2">
							<input
								type="text"
								value={tag}
								onChange={(e) =>
									handleArrayChange("companyTags", index, e.target.value)
								}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., Amazon, Google"
							/>
							{formData.companyTags.length > 1 && (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={() => removeArrayItem("companyTags", index)}
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

				{/* Submit Button */}
				<div className="flex gap-4">
					<Button type="submit" disabled={loading} className="flex-1">
						{loading ? "Creating..." : "Create Problem"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate("/problems")}
						disabled={loading}
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}
