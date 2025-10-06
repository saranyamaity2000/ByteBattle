import { ProblemRepository } from "./../repositories/problem.repo";
import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { TestcaseService } from "../services/testcase.service";
import logger from "../config/logger.config";
import { ProblemService } from "../services/problem.service";

class TestcaseController {
	constructor(
		private readonly testcaseService: TestcaseService,
		private readonly problemService: ProblemService
	) {}

	uploadTestCaseFile = async (req: Request, res: Response) => {
		const file = req.file;
		if (!file) {
			throw new BadRequestError("No JSON File found for Testcase Upload");
		}
		const problemSlug = req.params.problemSlug as string;
		const problem = await this.problemService.getProblemBySlug(problemSlug);
		if (!problem) {
			throw new NotFoundError(`Problem with slug '${problemSlug}' not found`);
		}

		logger.info("validating uploaded test case");
		await this.testcaseService.validateUploadedTestCase(file);
		logger.info("uploaded test case validated successfully");

		logger.info("Starting testcase upload process");
		const testcaseUrl = await this.testcaseService.uploadTestCaseToS3(file, problemSlug);
		logger.info("Testcase upload process completed successfully");

		await this.problemService.updateTestcaseUrl(problemSlug, testcaseUrl);

		res.json({
			success: true,
			testcaseUrl,
		});
	};

	downloadTestCaseFile = async (req: Request, res: Response) => {
		const problemSlug = req.params.problemSlug as string;
		const problem = await this.problemService.getProblemBySlug(problemSlug);
		if (!problem) {
			throw new NotFoundError(`Problem with slug '${problemSlug}' not found`);
		}
		if (!problem.testcaseUrl) {
			throw new NotFoundError(`No test cases found for problem with slug '${problemSlug}'`);
		}

		logger.info("Starting testcase download process");
		const { stream, contentType, fileName } = await this.testcaseService.downloadTestCaseFromS3(
			problem.testcaseUrl
		);
		logger.info("Testcase download process completed successfully");

		res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
		res.setHeader("Content-Type", contentType);
		stream.pipe(res);
	};
}

const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository);
const testcaseService = new TestcaseService();
export const testcaseController = new TestcaseController(testcaseService, problemService);
