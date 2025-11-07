import { problemService, type GeneratedApiProblem } from "@/services/problemService";
import { useState } from "react";

export const useGeneratedProblem = () => {
	const [generatedProblem, setGeneratedProblem] = useState<GeneratedApiProblem | null>(null);
	const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const generateProblem = async (prompt: string) => {
		try {
			setIsGeneratingProblem(true);
			setErrorMessage(null);

			const response = await problemService.getGeneratedProblem(prompt);
			if (response.invalidPromptReason) {
				setErrorMessage(response.invalidPromptReason);
				setGeneratedProblem(null);
			} else {
				setGeneratedProblem(response.problem);
				setErrorMessage(null);
			}
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Failed to generate problem");
			setGeneratedProblem(null);
		} finally {
			setIsGeneratingProblem(false);
		}
	};

	return {
		generatedProblem,
		isGeneratingProblem,
		errorMessage,
		generateProblem,
	};
};
