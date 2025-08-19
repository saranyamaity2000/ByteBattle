import { ProblemService } from "./../services/problem.service";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";
import { ProblemRepository } from "../repositories/problem.repo";
import { IProblem } from "../models/problem.model";

class ProblemController {
	constructor(private readonly problemService: ProblemService) {}

	public getProblems = async (
		_req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const problems: IProblem[] = await this.problemService.getAllProblems();
			res.status(200).json({ data: problems });
		} catch (error) {
			logger.error(error);
			next(error);
		}
	};

	public getProblemBySlug = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { slug } = req.params;
			const problem = await this.problemService.getProblemBySlug(slug);
			res.status(200).json({ data: problem });
		} catch (error) {
			logger.error(error);
			next(error);
		}
	};

	public createProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const newProblem = await this.problemService.createProblem(req.body);
			res.status(201).json({ data: newProblem });
		} catch (error) {
			logger.error(error);
			next(error);
		}
	};

	public updateProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { slug } = req.params;
			const updatedProblem = await this.problemService.updateProblem(slug, req.body);
			res.status(200).json({ data: updatedProblem });
		} catch (error) {
			logger.error(error);
			next(error);
		}
	};

	public deleteProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			const { slug } = req.params;
			await this.problemService.deleteProblem(slug);
			res.status(200).json({ message: `Problem ${slug} deleted successfully` });
		} catch (error) {
			logger.error(error);
			next(error);
		}
	};
}

const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository);
export const problemController = new ProblemController(problemService);
