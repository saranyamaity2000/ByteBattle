import express from "express";
import challengeController from "../../controllers/challenge.controller.js";
import { verifySupabaseToken } from "../../middlewares/auth.middleware.js";

const v1Router = express.Router();

v1Router.get("/challenges/ongoing", verifySupabaseToken, challengeController.getOngoingChallenges);
v1Router.get("/challenges/past", verifySupabaseToken, challengeController.getPastChallenges);

export default v1Router;
