import { ProblemCreationDTO } from "../dtos/problem.dto";
import { IProblem } from "../models/problem.model";
import { ProblemRepository } from "./../repositories/problem.repo";
export class ProblemService {
	constructor(private readonly problemRepository: ProblemRepository) {}

	async createProblem(data: ProblemCreationDTO): Promise<IProblem> {
		return this.problemRepository.createProblem(data);
	}

	async getProblemBySlug(slug: string): Promise<IProblem | null> {
		return this.problemRepository.getProblemBySlug(slug);
	}

	async updateProblem(slug: string, data: Partial<IProblem>): Promise<IProblem | null> {
		return this.problemRepository.updateProblem(slug, data);
	}

	async deleteProblem(slug: string): Promise<IProblem | null> {
		return this.problemRepository.deleteProblem(slug);
	}

	async getAllProblems(): Promise<IProblem[]> {
		return this.problemRepository.getAllProblems();
	}
}
