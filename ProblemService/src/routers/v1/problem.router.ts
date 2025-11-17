import express from "express";
import { problemController } from "../../controllers/problem.controller";
import { validateRequestBody } from "../../validators";
import {
	ProblemCreationZodSchema,
	ProblemUpdateZodSchema,
	PromptForProblemGenerationSchema,
} from "../../validators/problem.validator";
import { verifySupabaseToken, optionalSupabaseAuth } from "../../middlewares/auth.middleware";

export const problemRouter = express.Router();

// Public routes (no auth required, but user info attached if available)
problemRouter.get("/", optionalSupabaseAuth, problemController.getProblems);
problemRouter.get(
	// fetch random published problem ID
	"/id/random",
	optionalSupabaseAuth,
	problemController.getRandomProblemId
);
// fetch problemSlug by problemId
problemRouter.get("/slug/:id", optionalSupabaseAuth, problemController.getSlugByProblemId);

// currently public but later for premium problem set only for authenticated users
problemRouter.get("/by-id/:id", optionalSupabaseAuth, problemController.getProblemById);
problemRouter.get("/:slug", optionalSupabaseAuth, problemController.getProblemBySlug);

// Protected routes (require authentication)
problemRouter.post(
	"/",
	verifySupabaseToken,
	validateRequestBody(ProblemCreationZodSchema),
	problemController.createProblem
);
problemRouter.put(
	"/:slug",
	verifySupabaseToken,
	validateRequestBody(ProblemUpdateZodSchema),
	problemController.updateProblem
);
problemRouter.patch("/:slug/publish", verifySupabaseToken, problemController.publishProblem);
problemRouter.delete("/:slug", verifySupabaseToken, problemController.deleteProblem);
problemRouter.post(
	"/generate-problem-by-prompt",
	verifySupabaseToken,
	validateRequestBody(PromptForProblemGenerationSchema),
	problemController.generateProblemByPrompt
);
