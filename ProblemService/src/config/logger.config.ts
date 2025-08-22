import winston from "winston";
import { getCorrelationId } from "../utils/helpers/request.helpers";
import DailyRotateFile from "winston-daily-rotate-file";

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: "MM-DD-YYYY HH:mm:ss" }),
		winston.format.errors({ stack: true }),
		winston.format.printf(({ level, message, timestamp, stack, ...data }) => {
			const correlationId = getCorrelationId();
			const upperLevel = level.toUpperCase().padEnd(5); // Ensure level is uppercase and padded to 5 characters to have consistency
			const CID = correlationId ? `[CID: ${correlationId}] ` : "";

			// Base log format
			let logOutput = `[${timestamp}] [${upperLevel}] ${CID}${message}`;

			// Add stack trace for errors
			if (stack) {
				logOutput += `\nStack: ${stack}`;
			}

			// Add extra data if present
			if (Object.keys(data).length > 0) {
				logOutput += `\nData: ${JSON.stringify(data, null, 2)}`;
			}

			return logOutput;
		})
	),
	transports: [
		new winston.transports.Console(),
		new DailyRotateFile({
			filename: "logs/%DATE%-app.log", // The file name pattern
			datePattern: "YYYY-MM-DD", // The date format
			maxSize: "20m", // The maximum size of the log file
			maxFiles: "14d", // The maximum number of log files to keep
		}),
		// TODO: add logic to integrate and save logs in mongo
	],
});

export default logger;
