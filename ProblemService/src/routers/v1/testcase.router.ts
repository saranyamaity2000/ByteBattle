import express from "express";
import { uploadTestcaseFileMiddleware } from "../../middlewares/upload.middleware";
import { testcaseController } from "../../controllers/testcase.controller";
import { verifySupabaseToken } from "../../middlewares/auth.middleware";

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
	verifySupabaseToken,
	testcaseController.downloadTestCaseFile
);
