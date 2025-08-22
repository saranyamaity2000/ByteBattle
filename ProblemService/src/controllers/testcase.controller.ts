import { Request, Response } from "express";
import { BadRequestError } from "../utils/errors/app.error";
import { TestcaseService } from "../services/testcase.service";
import logger from "../config/logger.config";

class TestcaseController {
	constructor(private readonly testcaseService: TestcaseService) {}

	uploadTestCaseFile = async (req: Request, res: Response) => {
		logger.info("Starting testcase upload process");
		const file = req.file;
		if (!file) {
			throw new BadRequestError("No JSON File found for Testcase Upload");
		}
		await this.testcaseService.validateUploadedTestCase(file);
		const testcaseUrl = await this.testcaseService.uploadTestCaseToS3(file);
		logger.info("Testcase upload process completed successfully");
		res.json({
			success: true,
			testcaseUrl,
		});
	};
}

const testcaseService = new TestcaseService();
export const testcaseController = new TestcaseController(testcaseService);
