import type { IChallenge } from "../models/challenge.model.js";
import challengeService from "../services/challenge.service.js";
import { type Request, type Response } from "express";

class ChallengeController {
	async getOngoingChallenges(req: Request, res: Response) {
		if (!req.user?.email) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		const userEmail = req.user?.email;
		const challenges = await challengeService.getOngoingChallenges(userEmail);
		res.status(200).json({
			success: true,
			data: challenges,
		});
	}
	async getPastChallenges(req: Request, res: Response) {
		if (!req.user?.email) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		const userEmail = req.user?.email;
		const challenges = await challengeService.getPastChallenges(userEmail);
		res.status(200).json({
			success: true,
			data: challenges,
		});
	}

	async handleChallengeCallback(req: Request, res: Response) {
		const { eventName, eventData } = req.body;
		if (eventName !== "submissionSuccess") {
			return res.status(400).json({ error: "Unsupported event" });
		} else {
			if (!eventData || !eventData.challengeId || !eventData.successfulSubmissionBy) {
				return res.status(400).json({ error: "Invalid event data" });
			}
			try {
				await challengeService.processSuccessfulChallengeSubmission(
					eventData.challengeId,
					eventData.successfulSubmissionBy
				);
				return res.status(200).json({ success: true });
			} catch (error) {
				return res.status(500).json({ error: "Failed to process event" });
			}
		}
	}
}

const challengeController = new ChallengeController();
export default challengeController;
