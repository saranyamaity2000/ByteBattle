import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { BadRequestError, InternalServerError } from "../utils/errors/app.error";
import { getFileExtension } from "../utils/helpers/extension.helpers";
import { TestCasesZodSchema } from "../validators/testcase.validator";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";

export class TestcaseService {
	validateUploadedTestCase(file: Express.Multer.File) {
		if (!file.buffer) {
			logger.error("No file buffer found");
			throw new InternalServerError(
				"File Buffer Expected! May be not using InMemoryStorage?"
			);
		}
		const fileContent: string = file.buffer.toString("utf-8");
		let parsedJson;
		try {
			parsedJson = JSON.parse(fileContent);
		} catch (err) {
			throw new BadRequestError("Uploaded file is not valid JSON");
		}
		const validation = TestCasesZodSchema.safeParse(parsedJson);
		if (!validation.success) {
			logger.error(`Invalid test case format: ${validation.error.message}`);
			throw new BadRequestError(`Invalid test case format: ${validation.error.message}`);
		} else {
			logger.info("Uploaded Testcase file is valid");
		}
	}

	async uploadTestCaseToS3(file: Express.Multer.File, fileNameToBeUsed: string) {
		const s3 = new S3Client({
			region: serverConfig.AWS.REGION,
			credentials: {
				accessKeyId: serverConfig.AWS.ACCESS_KEY_ID,
				secretAccessKey: serverConfig.AWS.ACCESS_KEY_SECRET,
			},
		});

		const params = {
			Bucket: serverConfig.AWS.BUCKET_NAME,
			Key: `testcases/${fileNameToBeUsed}`,
			Body: file.buffer,
			ContentType: file.mimetype,
		};

		const uploader = new Upload({
			client: s3,
			params,
		});

		try {
			logger.info(`Uploading test case to S3: ${params.Key}`);
			await uploader.done();
			logger.info(`Successfully uploaded test case to S3: ${params.Key}`);
			return `${params.Key}`; // return the S3 object Url path
		} catch (error) {
			logger.error(`Failed to upload test case to S3: ${error as Error}.message`);
			throw new BadRequestError("Failed to upload file to S3");
		}
	}
	async downloadTestCaseFromS3(testcaseUrl: string): Promise<{
		stream: Readable;
		contentType: string;
		fileName: string;
	}> {
		const s3 = new S3Client({
			region: serverConfig.AWS.REGION,
			credentials: {
				accessKeyId: serverConfig.AWS.ACCESS_KEY_ID,
				secretAccessKey: serverConfig.AWS.ACCESS_KEY_SECRET,
			},
		});

		const params = {
			Bucket: serverConfig.AWS.BUCKET_NAME,
			Key: testcaseUrl,
		};

		try {
			logger.info(`Downloading test case from S3: ${params.Key}`);
			const command = new GetObjectCommand(params);
			const response = await s3.send(command);

			if (!response.Body) {
				throw new InternalServerError("No response body from S3");
			}

			// Get content type from S3 response
			const contentType = response.ContentType || "application/octet-stream";

			// Extract filename from key and add proper extension
			const keyParts = testcaseUrl.split("/");
			const baseFileName = keyParts[keyParts.length - 1];
			const extension = getFileExtension(contentType);
			const fileName = baseFileName.includes(".")
				? baseFileName
				: `${baseFileName}${extension}`;
			return {
				stream: response.Body as Readable, // as per aws sdk doc, for NodeJs it's a Readable stream
				contentType,
				fileName,
			};
		} catch (error) {
			logger.error(`Failed to download test case from S3: ${(error as Error).message}`);
			throw new InternalServerError("Failed to download test case from S3");
		}
	}
}
