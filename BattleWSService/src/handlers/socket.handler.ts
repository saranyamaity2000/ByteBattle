import type { Socket, Server } from "socket.io";
import { redisService } from "../clients/redis.client.js";
import type { ChallengeData } from "../types/challenge.type.js";
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
		challengedFrom: challengedFrom,
		challengedTo: challengedTo,
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
	challengeStatus: { challengeId: string; hasAccepted: boolean },
	challengeData: ChallengeData
): Promise<void> {
	// Join the accepter to the challenge room FIRST
	// (the challenger already joined when they initiated the challenge)
	socket.join(`challenge:${challengeStatus.challengeId}`);

	// Fetch random problem ID from Problem Service
	const problemId: string | null = await problemClient.fetchRandomProblemId();
	if (!problemId) {
		console.error("Failed to get random problem ID");
		// Now both users are in the room, so both will receive the error
		io.to(`challenge:${challengeStatus.challengeId}`).emit("match_error", {
			challengeId: challengeStatus.challengeId,
			error: "Failed to fetch problem",
		});
		// Clean up Redis challenge data
		await redisService.publisher.del(`challenge:${challengeStatus.challengeId}`);
		return;
	}

	// Store challenge in db
	await storeChallenge(
		challengeStatus.challengeId,
		challengeData.fromEmail,
		challengeData.toEmail,
		problemId
	);

	// Prepare match start data
	const matchStartData = {
		challengedBy: challengeData.fromEmail,
		challengedTo: challengeData.toEmail,
		challengeId: challengeStatus.challengeId,
		problemId,
	};

	// Emit match_start to both users in the challenge room
	// Redis adapter ensures this reaches both users even if on different servers
	io.to(`challenge:${challengeStatus.challengeId}`).emit("match_start", matchStartData);

	// Clean up Redis challenge data
	await redisService.publisher.del(`challenge:${challengeStatus.challengeId}`);
	console.log(
		`Match started for challenge ${challengeStatus.challengeId} with problem ${problemId}`
	);
}

/**
 * Handles the challenge rejection flow
 * Redis adapter handles cross-server communication automatically
 */
async function handleChallengeRejection(
	io: Server,
	challengeStatus: { challengeId: string },
	challengeData: ChallengeData
): Promise<void> {
	// Emit rejection to the challenge room (reaches challenger even on different server)
	io.to(`challenge:${challengeStatus.challengeId}`).emit("challenge-rejected", {
		challengeId: challengeStatus.challengeId,
		rejectedBy: challengeData.toEmail,
	});

	// Clean up: remove all sockets from the challenge room
	io.in(`challenge:${challengeStatus.challengeId}`).socketsLeave(
		`challenge:${challengeStatus.challengeId}`
	);

	// Clean up Redis challenge data
	await redisService.publisher.del(`challenge:${challengeStatus.challengeId}`);
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
			challengedBy: socket.user.email,
			challengeId: `${challengeId}`,
		});
	});
};

export const handleChallengeReply: SocketHandler = (socket, io) => {
	socket.on(
		"challenge-reply",
		async (challengeStatus: { challengeId: string; hasAccepted: boolean }) => {
			try {
				// Check if the challenge exists
				const challengeDataStr = await redisService.publisher.get(
					`challenge:${challengeStatus.challengeId}`
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
						challengeStatus.challengeId,
						"Challenge Data:",
						challengeData
					);
					return;
				}

				// Handle rejection
				if (!challengeStatus.hasAccepted) {
					await handleChallengeRejection(io, challengeStatus, challengeData);
					return;
				}

				// Handle acceptance
				await handleChallengeAcceptance(socket, io, challengeStatus, challengeData);
			} catch (error) {
				console.error("Error in challenge reply handler:", error);
			}
		}
	);
};
