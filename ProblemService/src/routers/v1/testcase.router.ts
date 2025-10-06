import express from "express";
import { uploadTestcaseFileMiddleware } from "../../middlewares/upload.middleware";
import { testcaseController } from "../../controllers/testcase.controller";

export const testcaseRouter = express.Router();

testcaseRouter.post(
	"/upload/:problemSlug",
	uploadTestcaseFileMiddleware,
	testcaseController.uploadTestCaseFile
);

testcaseRouter.get("/download/:problemSlug", testcaseController.downloadTestCaseFile);
