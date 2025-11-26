import type { BasicChallengeInfo, CreateChallengeDTO } from "../types/challenge.type.js";
import type { IChallenge } from "../models/challenge.model.js";
import { Utils } from "../utilities/util.js";
import { Redis } from "ioredis";
import { redisClient } from "../clients/redis.client.js";
import ChallengeModel from "../models/challenge.model.js";
import challengeRepo from "../repos/challenge.repo.js";

class ChallengeService {
	constructor(private readonly rc: Redis) {}
	async storeChallengeReq(challengeId: string, challengeData: BasicChallengeInfo): Promise<void> {
		await this.rc.set(`challengeReq:${challengeId}`, JSON.stringify(challengeData));
	}
	async getChallengeReq(challengeId: string): Promise<BasicChallengeInfo | null> {
		const challengeDataStr = await this.rc.get(`challengeReq:${challengeId}`);
		if (!challengeDataStr) {
			return null;
		}
		return JSON.parse(challengeDataStr) as BasicChallengeInfo;
	}
	async deleteChallengeReq(challengeId: string): Promise<void> {
		await this.rc.del(`challengeReq:${challengeId}`);
	}
	async getUniqueBase62Id(): Promise<string> {
		const uniqueId = await this.rc.incr("uniqueId:number");
		return Utils.getBase62String(uniqueId);
	}
	async getOngoingChallenges(userEmail: string): Promise<IChallenge[]> {
		const challenges = await challengeRepo.getOngoingChallenges(userEmail);
		return challenges;
	}
	async getPastChallenges(userEmail: string): Promise<IChallenge[]> {
		const challenges = await challengeRepo.getPastChallenges(userEmail);
		return challenges;
	}
	async createChallenge(createChallengeDTO: CreateChallengeDTO): Promise<IChallenge> {
		const challenge = await challengeRepo.createChallenge(createChallengeDTO);
		return challenge;
	}
}

const challengeService = new ChallengeService(redisClient.client);
export default challengeService;
