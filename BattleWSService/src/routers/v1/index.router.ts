import express from "express";
import challengeController from "../../controllers/challenge.controller.js";
import { verifyInternalAccess, verifySupabaseToken } from "../../middlewares/auth.middleware.js";

const v1Router = express.Router();

v1Router.get("/challenges/ongoing", verifySupabaseToken, challengeController.getOngoingChallenges);
v1Router.get("/challenges/past", verifySupabaseToken, challengeController.getPastChallenges);
v1Router.get("/challenges/:challengeId", verifySupabaseToken, challengeController.getChallengeById);
v1Router.get(
	"/challenges/available/:email",
	verifySupabaseToken,
	challengeController.isAvailableForChallenge,
);
v1Router.post(
	"/challenges/callback",
	verifyInternalAccess,
	challengeController.handleChallengeCallback,
);

export default v1Router;
