import { useState } from "react";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";

export interface TestCase {
	id: string;
	input: string;
}

interface TestCaseInputProps {
	onTestCasesChange: (testCases: TestCase[]) => void;
}

export default function TestCaseInput({ onTestCasesChange }: TestCaseInputProps) {
	const [testCases, setTestCases] = useState<TestCase[]>([
		{ id: crypto.randomUUID(), input: "" },
	]);

	const handleAddTestCase = () => {
		const newTestCase: TestCase = {
			id: crypto.randomUUID(),
			input: "",
		};
		const updatedTestCases = [...testCases, newTestCase];
		setTestCases(updatedTestCases);
		onTestCasesChange(updatedTestCases);
	};

	const handleRemoveTestCase = (id: string) => {
		if (testCases.length === 1) return; // Keep at least one test case
		const updatedTestCases = testCases.filter((tc) => tc.id !== id);
		setTestCases(updatedTestCases);
		onTestCasesChange(updatedTestCases);
	};

	const handleInputChange = (id: string, value: string) => {
		const updatedTestCases = testCases.map((tc) =>
			tc.id === id ? { ...tc, input: value } : tc
		);
		setTestCases(updatedTestCases);
		onTestCasesChange(updatedTestCases);
	};

	return (
		<div className="h-full flex flex-col bg-white">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
				<h3 className="font-semibold text-gray-900">Test Cases</h3>
				<Button
					onClick={handleAddTestCase}
					size="sm"
					variant="outline"
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					Add Test Case
				</Button>
			</div>

			{/* Test Cases List */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{testCases.map((testCase, index) => (
					<div
						key={testCase.id}
						className="border border-gray-200 rounded-lg p-4 bg-gray-50"
					>
						<div className="flex items-center justify-between mb-2">
							<label className="text-sm font-medium text-gray-700">
								Test Case {index + 1}
							</label>
							{testCases.length > 1 && (
								<Button
									onClick={() => handleRemoveTestCase(testCase.id)}
									size="sm"
									variant="ghost"
									className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
						<textarea
							value={testCase.input}
							onChange={(e) => handleInputChange(testCase.id, e.target.value)}
							placeholder="Enter test case input..."
							className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono bg-white"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
