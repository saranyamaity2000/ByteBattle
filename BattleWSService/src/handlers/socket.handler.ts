import type { Socket, Server } from "socket.io";
import { redisService } from "../services/redis-service.js";
import type { ChallengeData } from "../types/challange.js";
import { ChallengeModel } from "../models/challenge.model.js";
import { serverConfig } from "../config/server.config.js";
import { problemClient } from "../clients/problem.client.js";

export type SocketHandler = (socket: Socket, io: Server) => void;

/**
 * TODO : storeChallenge <- service layer <- repository layer
 */
async function storeChallenge(
	challengeId: string,
	challengedFrom: string,
	challengedTo: string,
	problemId: string
): Promise<void> {
	await ChallengeModel.create({
		challengeId,
		challangedFrom: challengedFrom,
		challangedTo: challengedTo,
		problemId,
	});
}

/**
 * Handles the challenge acceptance flow
 * TODO: handling the scenario when both players are connected through different WS servers
 */
async function handleChallengeAcceptance(
	socket: Socket,
	io: Server,
	challengeStatus: { challangeId: string; hasAccepted: boolean },
	challengeData: ChallengeData
): Promise<void> {
	const opponentSocketId = await redisService.subscriber.get(`email:${challengeData.fromEmail}`);

	if (!opponentSocketId) {
		console.log(
			`User ${challengeData.fromEmail} not connected anymore but the challenge can still go on in background!`
		);
	}

	// Fetch random problem ID from Problem Service
	const problemId: string | null = await problemClient.fetchRandomProblemId();
	if (!problemId) {
		console.error("Failed to get random problem ID");
		// TODO: Emit error event to both users
		return;
	}

	// Store challenge in db
	await storeChallenge(
		challengeStatus.challangeId,
		challengeData.fromEmail,
		challengeData.toEmail,
		problemId
	);

	// (the challenger person already joined when challenged)
	socket.join(`challenge:${challengeStatus.challangeId}`);

	// Prepare match start data
	const matchStartData = {
		challangedBy: challengeData.fromEmail,
		challangedTo: challengeData.toEmail,
		challengeId: challengeStatus.challangeId,
		problemId,
	};

	// Emit match_start to both users
	// TODO: we can expose a rest API for UI to fetch on going match data to show user
	if (opponentSocketId) {
		io.to(opponentSocketId).emit("match_start", matchStartData);
	}
	io.to(socket.id).emit("match_start", matchStartData);

	// Clean up Redis challenge data
	await redisService.subscriber.del(`challenge:${challengeStatus.challangeId}`);
	console.log(
		`Match started for challenge ${challengeStatus.challangeId} with problem ${problemId}`
	);
}

/**
 * Handles the challenge rejection flow
 * TODO: handling the scenario when both players are connected through different WS servers
 */
async function handleChallengeRejection(
	io: Server,
	challengeStatus: { challangeId: string },
	challengeData: ChallengeData
): Promise<void> {
	await redisService.subscriber.del(`challenge:${challengeStatus.challangeId}`);

	const socketId = await redisService.subscriber.get(`email:${challengeData.fromEmail}`);
	if (socketId) {
		io.to(socketId).emit("challenge-rejected", {
			challengeId: challengeStatus.challangeId,
		});
		io.to(socketId).socketsLeave(`challenge:${challengeStatus.challangeId}`);
	}
}

/**
 * Validates if the user is authorized to respond to the challenge
 */
function isUserAuthorizedForChallenge(userEmail: string, challengeData: ChallengeData): boolean {
	return challengeData.toEmail === userEmail;
}

export const handleDisconnect: SocketHandler = (socket, _io) => {
	socket.on("disconnect", async () => {
		console.log("User disconnected:", socket.user.user_metadata.name || socket.user.email);
		await redisService.subscriber.del(`email:${socket.user.email}`);
	});
};

export const handleChallenge: SocketHandler = (socket, io) => {
	socket.on("challenge", async ({ chanllangeToEmail }: { chanllangeToEmail: string }) => {
		const opponentSocketId: string | null = await redisService.subscriber.get(
			`email:${chanllangeToEmail}`
		);
		if (!socket.user.email || !opponentSocketId) {
			return;
		}
		const challengeId = await redisService.getUniqueBase62Id();
		redisService.subscriber.set(
			`challenge:${challengeId}`,
			JSON.stringify({
				fromEmail: socket.user.email,
				toEmail: chanllangeToEmail,
			} satisfies ChallengeData)
		);
		socket.join(`challenge:${challengeId}`);
		io.to(opponentSocketId).emit("challenged", {
			challangedBy: socket.user.email,
			challengeId: `${challengeId}`,
		});
	});
};

export const handleChallengeReply: SocketHandler = (socket, io) => {
	socket.on(
		"challenge-reply",
		async (challangeStatus: { challangeId: string; hasAccepted: boolean }) => {
			try {
				// Check if the challenge exists
				const challengeDataStr = await redisService.subscriber.get(
					`challenge:${challangeStatus.challangeId}`
				);
				if (!challengeDataStr) {
					return;
				}

				// Parse and validate challenge data
				const challengeData = JSON.parse(challengeDataStr) as ChallengeData;

				// Check if the user is authorized to respond
				if (!isUserAuthorizedForChallenge(socket.user.email!, challengeData)) {
					console.log(
						"User not authorized to accept/reject challenge:",
						socket.user.user_metadata.name || socket.user.email,
						"Challenge Id:",
						challangeStatus.challangeId,
						"Challenge Data:",
						challengeData
					);
					return;
				}

				// Handle rejection
				if (!challangeStatus.hasAccepted) {
					await handleChallengeRejection(io, challangeStatus, challengeData);
					return;
				}

				// Handle acceptance
				await handleChallengeAcceptance(socket, io, challangeStatus, challengeData);
			} catch (error) {
				console.error("Error in challenge reply handler:", error);
			}
		}
	);
};
