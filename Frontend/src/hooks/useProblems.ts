import { useState, useEffect } from "react";
import { problemService } from "../services/problemService";
import { transformApiProblem, type Problem } from "../types/problem";

interface UseProblemsResult {
	problems: Problem[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export const useProblems = (): UseProblemsResult => {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProblems = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const apiProblems = await problemService.getProblems();
			const transformedProblems = apiProblems.map(transformApiProblem);
			setProblems(transformedProblems);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch problems");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProblems();
	}, []);

	return {
		problems,
		isLoading,
		error,
		refetch: fetchProblems,
	};
};

interface UseProblemResult {
	problem: Problem | null;
	isLoading: boolean;
	error: string | null;
}

export const useProblem = (id: string | undefined): UseProblemResult => {
	const [problem, setProblem] = useState<Problem | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			setProblem(null);
			setIsLoading(false);
			return;
		}

		const fetchProblem = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const apiProblem = await problemService.getProblemById(id);
				if (apiProblem) {
					setProblem(transformApiProblem(apiProblem));
				} else {
					setProblem(null);
					setError("Problem not found");
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch problem");
				setProblem(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProblem();
	}, [id]);

	return {
		problem,
		isLoading,
		error,
	};
};
