import type { ApiProblem } from "../services/problemService";

export interface Problem {
	id: string; // MongoDB _id
	slug: string; // URL-friendly identifier
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
	isPublished: boolean;
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
		id: apiProblem._id, // MongoDB _id
		slug: apiProblem.slug, // URL-friendly identifier
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
		isPublished: apiProblem.isPublished,
	};
};
