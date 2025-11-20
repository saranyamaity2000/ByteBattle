import { ProblemService } from "./../services/problem.service";
import { NextFunction, Request, Response } from "express";
import { ProblemRepository } from "../repositories/problem.repo";
import { IProblem, ProblemDifficulty } from "../models/problem.model";
import { generateProblemByAI } from "../generative-ai/problem.ai";
import logger from "../config/logger.config";

class ProblemController {
	constructor(private readonly problemService: ProblemService) {}

	public getProblems = async (
		_req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const problems: IProblem[] = await this.problemService.getAllProblems();
		res.status(200).json({ data: problems });
	};

	public getProblemBySlug = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { slug } = req.params;
		const problem = await this.problemService.getProblemBySlug(slug);
		res.status(200).json({ data: problem });
	};

	public getProblemById = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { id } = req.params;
		const problem = await this.problemService.getProblemById(id);
		res.status(200).json({ data: problem });
	};

	public createProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		// Use authenticated user's ID as author
		const problemData = {
			...req.body,
			author: req.user?.id || req.body.author, // Use authenticated user ID or fallback
		};
		const newProblem = await this.problemService.createProblem(problemData);
		res.status(201).json({ data: newProblem });
	};

	public updateProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { slug } = req.params;
		const updatedProblem = await this.problemService.updateProblem(slug, req.body);
		res.status(200).json({ data: updatedProblem });
	};

	public deleteProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { slug } = req.params;
		await this.problemService.deleteProblem(slug);
		res.status(200).json({ message: `Problem ${slug} deleted successfully` });
	};

	public publishProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { slug } = req.params;
		const publishedProblem = await this.problemService.publishProblem(slug);
		res.status(200).json({ data: publishedProblem });
	};

	generateProblemByPrompt = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { prompt } = req.body;
		if (!prompt) {
			res.status(400).json({ message: "Prompt is required" });
			return;
		}
		try {
			const result = await generateProblemByAI(prompt);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	};

	public getRandomProblemId = async (
		req: Request,
		res: Response,
		_next: NextFunction
	): Promise<void> => {
		logger.info("Fetching random published problem ID");
		const difficulty = req.query.difficulty as ProblemDifficulty;
		// Validate difficulty if provided
		if (difficulty && !Object.values(ProblemDifficulty).includes(difficulty)) {
			res.status(400).json({ error: "Invalid difficulty value" });
			return;
		}
		const problemId = await this.problemService.getRandomPublishedProblemId({ difficulty });
		logger.info(`Fetched random published problem ID: ${problemId}`);
		res.status(200).json({ data: { problemId } });
	};

	public getSlugByProblemId = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const { id } = req.params;
		const slug = await this.problemService.getSlugByProblemId(id);
		res.status(200).json({ data: { slug } });
	};
}

const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository);
export const problemController = new ProblemController(problemService);
