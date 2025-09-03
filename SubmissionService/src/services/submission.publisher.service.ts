import { FastifyBaseLogger } from "fastify";
import { SubmissionQueueMessageDTO } from "../dtos/submission.dto";
import { MessagingQueueService } from "./mq.service";

class SubmissionPublisherService implements SubmissionPublisherService {
	constructor(
		private readonly logger: FastifyBaseLogger,
		private readonly mqService: MessagingQueueService
	) {}

	async publishSubmission(queue: string, submission: SubmissionQueueMessageDTO): Promise<void> {
		// ensure the queue exists and if not creates the queue with persistent messages
		this.mqService.sendMessage(queue, Buffer.from(JSON.stringify(submission)));
		this.logger.info(`Message sent to ${queue}: ${JSON.stringify(submission)}`);
	}
}

export default SubmissionPublisherService;
