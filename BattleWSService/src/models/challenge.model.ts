import { Schema, model, Document } from "mongoose";

export enum ChallengeDifficulty {
	EASY = "easy",
	MEDIUM = "medium",
	HARD = "hard",
}

export interface IChallenge extends Document {
	challengeId: string;
	challengedFrom: string; // email of the challenger
	challengedTo: string; // email of the challenged user
	problemId: string; // the problem ID for this challenge
	createdAt: Date;
	updatedAt: Date;
	winner?: string; // email of the winner, optional
	timeLimitInMin: number; // time limit for the challenge in minutes
	difficulty: ChallengeDifficulty; // difficulty level of the challenge
}

const ChallengeSchema = new Schema<IChallenge>(
	{
		challengeId: { type: String, required: true, unique: true, index: true }, // this one we will use
		challengedFrom: { type: String, required: true },
		challengedTo: { type: String, required: true },
		problemId: { type: String, required: true },
		winner: { type: String, required: false },
		timeLimitInMin: { type: Number, required: true },
		difficulty: { type: String, required: true, enum: Object.values(ChallengeDifficulty) },
	},
	{ timestamps: true }
);

export const ChallengeModel = model<IChallenge>("Challenge", ChallengeSchema);

export default ChallengeModel;
