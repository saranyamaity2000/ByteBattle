import logger from "../config/logger.config";
import { ProblemCreationDTO } from "../dtos/problem.dto";
import { IProblem } from "../models/problem.model";
// import { sanitizeMarkdown } from "../utils/helpers/markdown.helpers";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { ProblemRepository } from "./../repositories/problem.repo";
export class ProblemService {
	constructor(private readonly problemRepository: ProblemRepository) {}

	async createProblem(data: ProblemCreationDTO): Promise<IProblem> {
		// TODO: Re-enable sanitizeMarkdown when ESM issue is fixed
		// data.statement = await sanitizeMarkdown(data.statement);
		logger.info("Problem statement creation, now proceeding with problem creation");
		return this.problemRepository.createProblem(data);
	}

	async getProblemBySlug(slug: string): Promise<IProblem | null> {
		return this.problemRepository.getProblemBySlug(slug);
	}

	async updateProblem(slug: string, data: Partial<IProblem>): Promise<IProblem | null> {
		if (data.statement) {
			// TODO: Re-enable sanitizeMarkdown when ESM issue is fixed
			// data.statement = await sanitizeMarkdown(data.statement);
			logger.info("Problem statement update, now proceeding with problem update");
		}
		return this.problemRepository.updateProblem(slug, data);
	}

	async deleteProblem(slug: string): Promise<IProblem | null> {
		return this.problemRepository.deleteProblem(slug);
	}

	async getAllProblems(): Promise<IProblem[]> {
		return this.problemRepository.getAllProblems();
	}

	async publishProblem(slug: string): Promise<IProblem | null> {
		const problem = await this.problemRepository.getProblemBySlug(slug);

		if (!problem) {
			throw new NotFoundError("Problem not found");
		}

		if (!problem.testcaseUrl) {
			throw new BadRequestError(
				"Cannot publish problem without test cases. Please upload test cases first."
			);
		}

		if (problem.isPublished) {
			throw new BadRequestError("Problem is already published");
		}

		const updateData = { isPublished: true };
		return this.problemRepository.updateProblem(slug, updateData);
	}

	async updateTestcaseUrl(slug: string, url: string): Promise<IProblem | null> {
		return await this.problemRepository.updateProblem(slug, { testcaseUrl: url });
	}
}
