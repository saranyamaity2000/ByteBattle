import challengeService from "../services/challenge.service.js";
import { type Request, type Response } from "express";
import socketService from "../services/socket.service.js";

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

	async getChallengeById(req: Request, res: Response) {
		if (!req.user?.email) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		try {
			const { challengeId } = req.params;
			if (!challengeId) {
				return res.status(400).json({ success: false, error: "Challenge ID is required" });
			}
			const challenge = await challengeService.getChallengeById(challengeId);
			if (!challenge) {
				return res.status(404).json({ success: false, error: "Challenge not found" });
			}
			// Only allow access if user is part of the challenge
			if (
				challenge.challengedFrom !== req.user.email &&
				challenge.challengedTo !== req.user.email
			) {
				return res.status(403).json({ success: false, error: "Access denied" });
			}
			res.status(200).json({
				success: true,
				data: challenge,
			});
		} catch (error) {
			console.error("Error fetching challenge:", error);
			return res.status(500).json({ success: false, error: "Failed to fetch challenge" });
		}
	}

	async handleChallengeCallback(req: Request, res: Response) {
		const { eventName, eventData } = req.body; // TODO : better validation using zod
		if (eventName !== "submissionSuccess") {
			return res.status(400).json({ error: "Unsupported event" });
		} else {
			if (!eventData || !eventData.challengeId || !eventData.successfulSubmissionBy) {
				return res.status(400).json({ error: "Invalid event data" });
			}
			try {
				await challengeService.processSuccessfulChallengeSubmission(
					eventData.challengeId,
					eventData.successfulSubmissionBy,
				);
				return res.status(200).json({ success: true });
			} catch (error) {
				return res.status(500).json({ success: false, error: "Failed to process event" });
			}
		}
	}

	async isAvailableForChallenge(req: Request, res: Response) {
		const email = req.params.email;
		if (!email) {
			return res.status(400).json({ success: false, error: "Email is required" });
		}
		const socketId = await socketService.getSocketId(email);
		const online = !!socketId;
		res.status(200).json({ success: true, data: { online } });
	}
}

const challengeController = new ChallengeController();
export default challengeController;
