import type { Socket, Server } from "socket.io";
import { redisService } from "../clients/redis.client.js";
import type { ChallengeData } from "../types/challange.js";
import { ChallengeModel } from "../models/challenge.model.js";
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
 * Redis adapter handles cross-server communication automatically
 */
async function handleChallengeAcceptance(
	socket: Socket,
	io: Server,
	challengeStatus: { challangeId: string; hasAccepted: boolean },
	challengeData: ChallengeData
): Promise<void> {
	// Join the accepter to the challenge room FIRST
	// (the challenger already joined when they initiated the challenge)
	socket.join(`challenge:${challengeStatus.challangeId}`);

	// Fetch random problem ID from Problem Service
	const problemId: string | null = await problemClient.fetchRandomProblemId();
	if (!problemId) {
		console.error("Failed to get random problem ID");
		// Now both users are in the room, so both will receive the error
		io.to(`challenge:${challengeStatus.challangeId}`).emit("match_error", {
			challengeId: challengeStatus.challangeId,
			error: "Failed to fetch problem",
		});
		// Clean up Redis challenge data
		await redisService.publisher.del(`challenge:${challengeStatus.challangeId}`);
		return;
	}

	// Store challenge in db
	await storeChallenge(
		challengeStatus.challangeId,
		challengeData.fromEmail,
		challengeData.toEmail,
		problemId
	);

	// Prepare match start data
	const matchStartData = {
		challangedBy: challengeData.fromEmail,
		challangedTo: challengeData.toEmail,
		challengeId: challengeStatus.challangeId,
		problemId,
	};

	// Emit match_start to both users in the challenge room
	// Redis adapter ensures this reaches both users even if on different servers
	io.to(`challenge:${challengeStatus.challangeId}`).emit("match_start", matchStartData);

	// Clean up Redis challenge data
	await redisService.publisher.del(`challenge:${challengeStatus.challangeId}`);
	console.log(
		`Match started for challenge ${challengeStatus.challangeId} with problem ${problemId}`
	);
}

/**
 * Handles the challenge rejection flow
 * Redis adapter handles cross-server communication automatically
 */
async function handleChallengeRejection(
	io: Server,
	challengeStatus: { challangeId: string },
	challengeData: ChallengeData
): Promise<void> {
	// Emit rejection to the challenge room (reaches challenger even on different server)
	io.to(`challenge:${challengeStatus.challangeId}`).emit("challenge-rejected", {
		challengeId: challengeStatus.challangeId,
		rejectedBy: challengeData.toEmail,
	});

	// Clean up: remove all sockets from the challenge room
	io.in(`challenge:${challengeStatus.challangeId}`).socketsLeave(
		`challenge:${challengeStatus.challangeId}`
	);

	// Clean up Redis challenge data
	await redisService.publisher.del(`challenge:${challengeStatus.challangeId}`);
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
		await redisService.publisher.del(`email:${socket.user.email}`);
	});
};

export const handleChallenge: SocketHandler = (socket, io) => {
	socket.on("challenge", async ({ chanllangeToEmail }: { chanllangeToEmail: string }) => {
		const opponentSocketId: string | null = await redisService.publisher.get(
			`email:${chanllangeToEmail}`
		);
		if (!socket.user.email || !opponentSocketId) {
			return;
		}
		const challengeId = await redisService.getUniqueBase62Id();
		await redisService.publisher.set(
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
				const challengeDataStr = await redisService.publisher.get(
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
