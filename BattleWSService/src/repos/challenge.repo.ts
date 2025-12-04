import { ChallengeModel, type IChallenge } from "../models/challenge.model.js";
import type { CreateChallengeDTO } from "../types/challenge.type.js";

class ChallengeRepo {
	constructor() {}

	async setWinner(challengeId: string, winner: string): Promise<IChallenge | null> {
		return ChallengeModel.findOneAndUpdate({ challengeId }, { winner }, { new: true }).exec();
	}

	async getOngoingChallenges(userEmail: string): Promise<IChallenge[]> {
		const challenges = await ChallengeModel.find({
			$and: [
				{
					$or: [{ challengedFrom: userEmail }, { challengedTo: userEmail }],
				},
				{
					winner: { $exists: false },
				},
				{
					$expr: {
						$gt: [
							{
								$add: ["$createdAt", { $multiply: ["$timeLimitInMin", 60 * 1000] }],
							},
							new Date(),
						],
					},
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

	async getChallengeById(challengeId: string): Promise<IChallenge | null> {
		return ChallengeModel.findOne({ challengeId }).exec();
	}
}

const challengeRepo = new ChallengeRepo();
export default challengeRepo;
