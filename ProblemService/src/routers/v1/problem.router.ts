import express from "express";
import { problemController } from "../../controllers/problem.controller";
import { validateRequestBody } from "../../validators";
import {
	ProblemCreationZodSchema,
	ProblemUpdateZodSchema,
} from "../../validators/problem.validator";
import { verifySupabaseToken, optionalSupabaseAuth } from "../../middlewares/auth.middleware";

export const problemRouter = express.Router();

// Public routes (no auth required, but user info attached if available)
problemRouter.get("/", optionalSupabaseAuth, problemController.getProblems);
// currently public but later for premium problem set only for authenticated users
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
