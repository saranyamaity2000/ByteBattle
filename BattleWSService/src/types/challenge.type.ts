import type { ChallengeDifficulty } from "../models/challenge.model.js";

export type BasicChallengeInfo = {
	fromEmail: string;
	toEmail: string;
	timeLimitInMin: number;
	difficulty: ChallengeDifficulty;
};
