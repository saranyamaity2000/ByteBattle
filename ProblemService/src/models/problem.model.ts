import { Schema, model, Document } from "mongoose";

// Difficulty enum for problems
export enum Difficulty {
	EASY = "easy",
	MEDIUM = "medium",
	HARD = "hard",
}

//---------- ALL Interfaces -----------
// Example sub-document interface
export interface IProblemExample {
	input: string;
	output: string;
	explanation?: string;
}

export interface ITestcase {
	testcaseName: string;
	url: string;
}
// Problem document interface
export interface IProblem extends Document {
	title: string;
	slug: string; // identifier
	statement: string; // markdown / HTML / plain text of the problem
	difficulty: Difficulty;
	examples: IProblemExample[];
	constraints?: string[]; // i.e. ["1 <= n <= 100", "1 <= m <= 100"]
	timeLimitMs?: number;
	memoryLimitKb?: number;
	author?: string; // for now string
	testcases: ITestcase[];

	isPublished: boolean;
	isPremium: boolean;

	submissionsCount: number;
	likes: number;
	editorial?: string; // markdown / HTML / plain text

	companyTags?: string[];
	topicTags?: string[];

	createdAt: Date;
	updatedAt: Date;
}

//---------- ALL Schemas -----------
const ProblemExampleSchema = new Schema<IProblemExample>(
	{
		input: { type: String, required: true },
		output: { type: String, required: true },
		explanation: { type: String }, // Optional explanation of the example
	},
	{ _id: false }
);
const TestcaseSchema = new Schema<ITestcase>(
	{
		testcaseName: { type: String, required: true },
		url: { type: String, required: true },
	},
	{ _id: false }
);
const ProblemSchema = new Schema<IProblem>(
	{
		title: { type: String, required: true, trim: true },
		slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
		statement: { type: String, required: true },
		difficulty: { type: String, enum: Object.values(Difficulty) },
		examples: { type: [ProblemExampleSchema], default: [] },
		constraints: { type: [String], default: [] },
		timeLimitMs: { type: Number, default: 1000 },
		memoryLimitKb: { type: Number, default: 65536 },
		author: { type: String },
		testcases: { type: [TestcaseSchema], required: true, minLength: 1 },
		isPublished: { type: Boolean, default: false, index: true },
		isPremium: { type: Boolean, default: false, index: true },
		submissionsCount: { type: Number, default: 0 },
		likes: { type: Number, default: 0 },
		editorial: { type: String },
		topicTags: { type: [String], default: [], index: true },
		companyTags: { type: [String], default: [], index: true },
	},
	{ timestamps: true }
);

// Auto-generate slug from title if not provided
ProblemSchema.pre("validate", function (next) {
	if (!this.slug && this.title) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "")
			.slice(0, 80);
	}
	next();
});
export const ProblemModel = model<IProblem>("Problem", ProblemSchema);

export default ProblemModel;
