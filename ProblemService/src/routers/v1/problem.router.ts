import express from "express";
import { problemController } from "../../controllers/problem.controller";
import { validateRequestBody } from "../../validators";
import {
	ProblemCreationZodSchema,
	ProblemUpdateZodSchema,
} from "../../validators/problem.validator";

export const problemRouter = express.Router();

problemRouter.get("/", problemController.getProblems);
problemRouter.get("/:slug", problemController.getProblemBySlug);
problemRouter.post(
	"/",
	validateRequestBody(ProblemCreationZodSchema),
	problemController.createProblem
);
problemRouter.put(
	"/:slug",
	validateRequestBody(ProblemUpdateZodSchema),
	problemController.updateProblem
);
problemRouter.patch("/:slug/publish", problemController.publishProblem);
problemRouter.delete("/:slug", problemController.deleteProblem);
