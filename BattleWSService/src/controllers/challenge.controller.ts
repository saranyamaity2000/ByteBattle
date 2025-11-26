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
}

const challengeController = new ChallengeController();
export default challengeController;
