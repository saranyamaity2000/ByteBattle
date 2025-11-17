import { Schema, model, Document } from "mongoose";

export interface IChallenge extends Document {
	challengeId: string;
	challangedFrom: string; // email of the challenger
	challangedTo: string; // email of the challenged user
	problemId: string; // the problem ID for this challenge
	createdAt: Date;
	updatedAt: Date;
	winner?: string; // email of the winner, optional
}

const ChallengeSchema = new Schema<IChallenge>(
	{
		challengeId: { type: String, required: true, unique: true, index: true }, // this one we will use
		challangedFrom: { type: String, required: true },
		challangedTo: { type: String, required: true },
		problemId: { type: String, required: true },
		winner: { type: String, required: false },
	},
	{ timestamps: true }
);

export const ChallengeModel = model<IChallenge>("Challenge", ChallengeSchema);

export default ChallengeModel;
