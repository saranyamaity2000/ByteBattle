import type { ChallengeDifficulty } from "../models/challenge.model.js";

export type BasicChallengeInfo = {
	fromEmail: string;
	toEmail: string;
	timeLimitInMin: number;
	difficulty: ChallengeDifficulty;
};

export type CreateChallengeDTO = {
	challengeId: string;
	challengedFrom: string;
	challengedTo: string;
	problemId: string;
	timeLimitInMin: number;
	difficulty: ChallengeDifficulty;
};
