import type { BasicChallengeInfo, CreateChallengeDTO } from "../types/challenge.type.js";
import type { IChallenge } from "../models/challenge.model.js";
import { Utils } from "../utilities/util.js";
import { Redis } from "ioredis";
import { redisClient } from "../clients/redis.client.js";
import challengeRepo from "../repos/challenge.repo.js";
import { Lock, Redlock } from "@sesamecare-oss/redlock";
import socketService from "./socket.service.js";
import type { Server } from "socket.io";

class ChallengeService {
	private readonly redlock: Redlock;
	private io: Server | null = null;

	constructor(private readonly rc: Redis) {
		this.redlock = new Redlock([rc], {
			driftFactor: 0.01,
			retryCount: 3,
			retryDelay: 200,
			retryJitter: 200,
			automaticExtensionThreshold: 500,
		});
	}

	attachIO(io: Server): void {
		this.io = io;
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

	async getChallengeById(challengeId: string): Promise<IChallenge | null> {
		return await challengeRepo.getChallengeById(challengeId);
	}

	async isOpponentOnline(opponentEmail: string): Promise<boolean> {
		const socketId = await socketService.getSocketId(opponentEmail);
		return !!socketId;
	}

	async processSuccessfulChallengeSubmission(
		challengeId: string,
		successfulSubmissionBy: string,
	): Promise<void> {
		console.log("aquiring lock for challenge:", challengeId);
		const lockKey = `lock:challenge:${challengeId}`;
		const lockTTL = 5000; // 5 seconds lock TTL // TODO configurable

		let lock: Lock | null = null;
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
				challenge.createdAt.getTime() + challenge.timeLimitInMin * 60 * 1000,
			);
			const now = new Date();

			if (now > challengeEndTime) {
				return;
			}

			const updatedChallenge = await challengeRepo.setWinner(
				challengeId,
				successfulSubmissionBy,
			);
			if (!updatedChallenge) {
				throw new Error("Failed to update challenge winner");
			} else {
				// we won't wait here for the socket to be sent
				this.announceChallengeCompletion(updatedChallenge);
			}
		} finally {
			if (lock) {
				console.log("releasing lock for challenge:", challengeId);
				await lock.release();
			}
		}
	}

	async announceChallengeCompletion(challenge: IChallenge) {
		if (!this.io) {
			throw new Error("Socket IO not initialized");
		}
		const socketIds = await Promise.all([
			socketService.getSocketId(challenge.challengedFrom),
			socketService.getSocketId(challenge.challengedTo),
		]);
		socketIds
			.filter((socketId) => socketId !== null)
			.forEach((socketId) => {
				this.io?.sockets.sockets.get(socketId)?.emit("challenge-completed", {
					challengeId: challenge.challengeId,
					winner: challenge.winner,
				});
			});
	}
}

const challengeService = new ChallengeService(redisClient.client);
export default challengeService;
