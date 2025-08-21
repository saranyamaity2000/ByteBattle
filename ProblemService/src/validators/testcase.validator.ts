import { z } from "zod";

const SingleTestCaseZodSchema = z.object({
	input: z.string().min(1).max(1000),
	output: z.string().min(1).max(1000),
});
export const TestCasesZodSchema = z.array(SingleTestCaseZodSchema).min(1);
