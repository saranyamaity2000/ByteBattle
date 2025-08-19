import { z } from "zod";

const DifficultyZodEnum = z.enum(["easy", "medium", "hard"]);
const ProblemExampleZodSchema = z.object({
	input: z.string(),
	output: z.string(),
	explanation: z.string().optional(),
});
const TestcaseZodSchema = z.object({
	testcaseName: z.string().min(1),
	url: z.string().min(1).url(),
});
export const ProblemCreationZodSchema = z.object({
	title: z.string().min(1),
	slug: z.string().min(1).optional(),
	statement: z.string().min(1),
	difficulty: DifficultyZodEnum,
	examples: z.array(ProblemExampleZodSchema).default([]),
	testcases: z.array(TestcaseZodSchema).default([]),
	constraints: z.array(z.string()).default([]),
	timeLimitMs: z.number().int().min(1).default(1000), // 1 second minimum
	memoryLimitKb: z.number().int().min(1).default(65536), // 64 MB minimum
	author: z.string().optional(),
	isPublished: z.boolean().default(false),
	isPremium: z.boolean().default(false),
	submissionsCount: z.number().int().default(0),
	likes: z.number().int().default(0),
	editorial: z.string().optional(),
	companyTags: z.array(z.string()).default([]),
	topicTags: z.array(z.string()).default([]),
});

// all fields optional for update
export const ProblemUpdateZodSchema = ProblemCreationZodSchema.partial();
