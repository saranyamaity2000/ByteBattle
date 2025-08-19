import { z } from "zod";

import { ProblemCreationZodSchema, ProblemUpdateZodSchema } from "../validators/problem.validator";

export type ProblemCreationDTO = z.infer<typeof ProblemCreationZodSchema>;
export type ProblemUpdateDTO = z.infer<typeof ProblemUpdateZodSchema>;