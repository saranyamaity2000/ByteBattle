import type { ApiProblem } from "../services/problemService";

export interface Problem {
	id: string;
	title: string;
	difficulty: "Easy" | "Medium" | "Hard";
	category: string;
	description: string;
	constraints: string[];
	examples: {
		input: string;
		output: string;
		explanation?: string;
	}[];
	starterCode: {
		cpp: string;
		python: string;
	};
}

// Adapter: Transform API problem to local Problem interface
export const transformApiProblem = (apiProblem: ApiProblem): Problem => {
	const normalizeDifficulty = (diff: string): "Easy" | "Medium" | "Hard" => {
		const normalized = diff.toLowerCase();
		if (normalized === "easy") return "Easy";
		if (normalized === "medium") return "Medium";
		if (normalized === "hard") return "Hard";
		return "Easy";
	};

	// Extract main topic as category
	const category = apiProblem.topicTags?.[0] || "General";

	return {
		id: apiProblem.slug, // Use slug as ID for routing
		title: apiProblem.title,
		difficulty: normalizeDifficulty(apiProblem.difficulty),
		category,
		description: apiProblem.statement,
		constraints: apiProblem.constraints,
		examples: apiProblem.examples,
		starterCode: {
			cpp: "// Your code here",
			python: "# Your code here",
		},
	};
};
