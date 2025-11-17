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

	async getProblemById(id: string): Promise<IProblem | null> {
		return ProblemModel.findById(id).exec();
	}

	async getProblemSlugbyId(id: string): Promise<string | null> {
		const problem = await ProblemModel.findById(id).select("slug").exec();
		return problem ? problem.slug : null;
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

	async getPublishedProblemsCount(): Promise<number> {
		return await ProblemModel.countDocuments({ isPublished: true }).exec();
	}

	async getPublishedProblemIdByOffset(offset: number): Promise<string | null> {
		const problem = await ProblemModel.findOne({ isPublished: true })
			.skip(offset)
			.select("_id")
			.exec();
		return problem ? problem.id.toString() : null;
	}
}
