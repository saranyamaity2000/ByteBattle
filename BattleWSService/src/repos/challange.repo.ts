import { ChallengeModel, type IChallenge } from "../models/challenge.model.js";
import type { CreateChallengeDTO } from "../types/challenge.type.js";

class ChallengeRepo {
	constructor() {}

	async getOngoingChallenges(userEmail: string): Promise<IChallenge[]> {
		const challenges = await ChallengeModel.find({
			$and: [
				{
					$or: [{ challengedFrom: userEmail }, { challengedTo: userEmail }],
				},
				{
					$or: [
						{ winner: { $exists: true } },
						{
							$expr: {
								$gt: [
									{
										$add: [
											"$createdAt",
											{ $multiply: ["$timeLimitInMin", 60 * 1000] },
										],
									},
									new Date(),
								],
							},
						},
					],
				},
			],
		});
		return challenges;
	}

	async getPastChallenges(userEmail: string): Promise<IChallenge[]> {
		const challenges = await ChallengeModel.find({
			$and: [
				{
					$or: [{ challengedFrom: userEmail }, { challengedTo: userEmail }],
				},
				{
					$or: [
						{ winner: { $exists: true } },
						{
							$expr: {
								$lte: [
									{
										$add: [
											"$createdAt",
											{ $multiply: ["$timeLimitInMin", 60 * 1000] },
										],
									},
									new Date(),
								],
							},
						},
					],
				},
			],
		});
		return challenges;
	}

	async createChallenge(challengeData: CreateChallengeDTO): Promise<IChallenge> {
		const challenge = await ChallengeModel.create(challengeData);
		return challenge;
	}
}

const challengeRepo = new ChallengeRepo();
export default challengeRepo;
