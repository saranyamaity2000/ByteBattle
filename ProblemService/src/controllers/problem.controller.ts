import { ProblemService } from "./../services/problem.service";
import { NextFunction, Request, Response } from "express";
import { ProblemRepository } from "../repositories/problem.repo";
import { IProblem } from "../models/problem.model";

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

	public createProblem = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		const newProblem = await this.problemService.createProblem(req.body);
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
}

const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository);
export const problemController = new ProblemController(problemService);
