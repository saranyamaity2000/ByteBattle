import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ProblemSelectorProps {
	onProblemSelect: (problem: string) => void;
	selectedProblem: string | null;
}

export default function ProblemSelector({
	onProblemSelect,
	selectedProblem,
}: ProblemSelectorProps) {
	const problems = [
		{ id: "two-sum", name: "Two Sum", difficulty: "Easy" },
		{ id: "reverse-string", name: "Reverse String", difficulty: "Easy" },
		{ id: "palindrome", name: "Valid Palindrome", difficulty: "Easy" },
		{ id: "fibonacci", name: "Fibonacci Number", difficulty: "Easy" },
		{ id: "binary-search", name: "Binary Search", difficulty: "Medium" },
		{ id: "merge-intervals", name: "Merge Intervals", difficulty: "Medium" },
	];

	return (
		<div className="w-full max-w-md">
			<h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
				Select a Problem
			</h3>
			<Select onValueChange={onProblemSelect} value={selectedProblem || undefined}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Choose a coding problem..." />
				</SelectTrigger>
				<SelectContent>
					{problems.map((problem) => (
						<SelectItem key={problem.id} value={problem.id}>
							<div className="flex items-center justify-between w-full">
								<span>{problem.name}</span>
								<span
									className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
										problem.difficulty === "Easy"
											? "bg-green-100 text-green-800"
											: problem.difficulty === "Medium"
											? "bg-yellow-100 text-yellow-800"
											: "bg-red-100 text-red-800"
									}`}
								>
									{problem.difficulty}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
