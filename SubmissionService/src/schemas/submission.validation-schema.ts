import { FastifySchema } from "fastify";
import { SupportedSubmissionLang, SubmissionVerdict } from "../models/submission.model";

// JSON Schema for creating a submission
export const createSubmissionSchema: FastifySchema["body"] = {
	type: "object",
	required: ["problemId", "lang", "code"],
	properties: {
		problemId: {
			type: "string",
			minLength: 1,
			pattern: "^[a-zA-Z0-9_-]+$", // Only allow valid string IDs
		},
		lang: {
			type: "string",
			enum: Object.values(SupportedSubmissionLang),
		},
		code: {
			type: "string",
			minLength: 1,
		},
		userId: {
			type: "string",
			minLength: 1,
			pattern: "^[a-zA-Z0-9_-]+$", // Only allow valid string IDs
		},
	},
	additionalProperties: false,
} as const;

// JSON Schema for updating submission status
export const updateSubmissionSchema: FastifySchema["body"] = {
	type: "object",
	required: ["status"],
	properties: {
		status: {
			type: "string",
			enum: ["pending", "processing", "completed", "failed"],
		},
		result: {
			type: "object",
			required: ["verdict"],
			properties: {
				verdict: {
					type: "string",
					enum: Object.values(SubmissionVerdict),
				},
				score: {
					type: "number",
					minimum: 0,
					maximum: 100,
				},
				executionTime: {
					type: "number",
					minimum: 0,
				},
				memoryUsed: {
					type: "number",
					minimum: 0,
				},
				testCasesPassed: {
					type: "number",
					minimum: 0,
				},
				totalTestCases: {
					type: "number",
					minimum: 0,
				},
				error: {
					type: "string",
				},
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,
} as const;

// JSON Schema for route parameters
export const submissionParamsSchema: FastifySchema["params"] = {
	type: "object",
	required: ["id"],
	properties: {
		id: {
			type: "string",
			minLength: 1,
		},
	},
	additionalProperties: false,
} as const;
