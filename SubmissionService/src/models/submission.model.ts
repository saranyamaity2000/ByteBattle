import { Document, Schema, model } from "mongoose";

export enum SupportedSubmissionLang {
	CPP = "c++",
	PYTHON3 = "python3",
}

export type SubmissionStatus = "pending" | "processing" | "completed" | "failed";

export enum SubmissionVerdict {
	ACCEPTED = "ACCEPTED",
	WRONG_ANSWER = "WRONG_ANSWER",
	TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
	RUNTIME_ERROR = "RUNTIME_ERROR",
	COMPILATION_ERROR = "COMPILATION_ERROR",
}
export interface ISubmissionResult {
	verdict: SubmissionVerdict;
	score?: number;
	executionTime?: number;
	memoryUsed?: number;
	testCasesPassed?: number;
	totalTestCases?: number;
	error?: string;
}
export interface ISubmission extends Document {
	problemId: string;
	lang: SupportedSubmissionLang;
	code: string;
	userId?: string;
	status: SubmissionStatus;
	result?: ISubmissionResult;
	createdAt: Date;
	updatedAt: Date;
}

// Mongoose Schema for SubmissionResult
const submissionResultSchema = new Schema<ISubmissionResult>(
	{
		verdict: {
			type: String,
			enum: {
				values: Object.values(SubmissionVerdict),
				message:
					"Invalid verdict: {VALUE}. Must be one of: " +
					Object.values(SubmissionVerdict).join(", "),
			},
			required: [true, "Verdict is required"],
		},
		score: {
			type: Number,
			min: [0, "Score cannot be negative"],
			max: [100, "Score cannot exceed 100"],
		},
		executionTime: {
			type: Number,
			min: [0, "Execution time cannot be negative"],
		},
		memoryUsed: {
			type: Number,
			min: [0, "Memory used cannot be negative"],
		},
		testCasesPassed: {
			type: Number,
			min: [0, "Test cases passed cannot be negative"],
		},
		totalTestCases: {
			type: Number,
			min: [0, "Total test cases cannot be negative"],
		},
		error: {
			type: String,
		},
	},
	{ _id: false }
);

// Mongoose Schema for Submission
const submissionSchema = new Schema<ISubmission>(
	{
		problemId: {
			type: String,
			required: true,
			trim: true,
		},
		lang: {
			type: String,
			enum: Object.values(SupportedSubmissionLang),
			required: true,
		},
		code: {
			type: String,
			required: true,
		},
		userId: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed"],
			default: "pending",
		},
		result: {
			type: submissionResultSchema,
			default: null,
		},
	},
	{
		timestamps: true, // This automatically adds createdAt and updatedAt fields
		toJSON: {
			transform: (_, record) => {
				delete (record as any).__v; // delete __v field
				record.id = record._id; // add id field
				delete record._id; // delete _id field
				return record;
			},
		},
	}
);

// Create indexes for better query performance
submissionSchema.index({ problemId: 1 });
submissionSchema.index({ userId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });

// Export the model
export const SubmissionModel = model<ISubmission>("Submission", submissionSchema);
