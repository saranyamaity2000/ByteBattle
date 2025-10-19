import express from "express";
import { uploadTestcaseFileMiddleware } from "../../middlewares/upload.middleware";
import { testcaseController } from "../../controllers/testcase.controller";
import { verifySupabaseToken, optionalSupabaseAuth } from "../../middlewares/auth.middleware";

export const testcaseRouter = express.Router();

// Protected routes (require authentication)
testcaseRouter.post(
	"/upload/:problemSlug",
	verifySupabaseToken,
	uploadTestcaseFileMiddleware,
	testcaseController.uploadTestCaseFile
);

testcaseRouter.get(
	"/download/:problemSlug",
	optionalSupabaseAuth,
	testcaseController.downloadTestCaseFile
);
