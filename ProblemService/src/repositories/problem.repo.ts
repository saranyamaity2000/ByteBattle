import { ProblemCreationDTO } from "../dtos/problem.dto";
import ProblemModel, { IProblem } from "../models/problem.model";

export class ProblemRepository {
	async createProblem(data: ProblemCreationDTO): Promise<IProblem> {
		const problem = new ProblemModel(data);
		return problem.save();
	}

	async getProblemBySlug(slug: string): Promise<IProblem | null> {
		return ProblemModel.findOne({ slug }).exec();
	}

	async updateProblem(slug: string, data: Partial<IProblem>): Promise<IProblem | null> {
		return ProblemModel.findOneAndUpdate({ slug }, data, { new: true }).exec();
	}

	async deleteProblem(slug: string): Promise<IProblem | null> {
		return ProblemModel.findOneAndDelete({ slug }).exec();
	}

	async getAllProblems(): Promise<IProblem[]> {
		return ProblemModel.find().exec();
	}
}
