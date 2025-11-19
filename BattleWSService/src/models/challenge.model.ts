import { Schema, model, Document } from "mongoose";

export interface IChallenge extends Document {
	challengeId: string;
	challengedFrom: string; // email of the challenger
	challengedTo: string; // email of the challenged user
	problemId: string; // the problem ID for this challenge
	createdAt: Date;
	updatedAt: Date;
	winner?: string; // email of the winner, optional
}

const ChallengeSchema = new Schema<IChallenge>(
	{
		challengeId: { type: String, required: true, unique: true, index: true }, // this one we will use
		challengedFrom: { type: String, required: true },
		challengedTo: { type: String, required: true },
		problemId: { type: String, required: true },
		winner: { type: String, required: false },
	},
	{ timestamps: true }
);

export const ChallengeModel = model<IChallenge>("Challenge", ChallengeSchema);

export default ChallengeModel;
