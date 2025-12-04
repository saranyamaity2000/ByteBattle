import type { BasicChallengeInfo, CreateChallengeDTO } from "../types/challenge.type.js";
import type { IChallenge } from "../models/challenge.model.js";
import { Utils } from "../utilities/util.js";
import { Redis } from "ioredis";
import { redisClient } from "../clients/redis.client.js";
import challengeRepo from "../repos/challenge.repo.js";
import { Redlock } from "@sesamecare-oss/redlock";

class ChallengeService {
	private readonly redlock: Redlock;

	constructor(private readonly rc: Redis) {
		this.redlock = new Redlock([rc], {
			driftFactor: 0.01,
			retryCount: 3,
			retryDelay: 200,
			retryJitter: 200,
			automaticExtensionThreshold: 500,
		});
	}
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

	async processSuccessfulChallengeSubmission(
		challengeId: string,
		successfulSubmissionBy: string
	): Promise<void> {
		const lockKey = `lock:challenge:${challengeId}`;
		const lockTTL = 5000; // 5 seconds lock TTL // TODO configurable

		let lock;
		try {
			lock = await this.redlock.acquire([lockKey], lockTTL);

			const challenge = await challengeRepo.getChallengeById(challengeId);
			if (!challenge) {
				throw new Error("Challenge not found");
			}

			if (challenge.winner) {
				return;
			}

			const challengeEndTime = new Date(
				challenge.createdAt.getTime() + challenge.timeLimitInMin * 60 * 1000
			);
			const now = new Date();

			if (now > challengeEndTime) {
				return;
			}

			const updatedChallenge = await challengeRepo.setWinner(
				challengeId,
				successfulSubmissionBy
			);
			if (!updatedChallenge) {
				throw new Error("Failed to update challenge winner");
			}
		} finally {
			if (lock) {
				await lock.release();
			}
		}
	}
}

const challengeService = new ChallengeService(redisClient.client);
export default challengeService;
