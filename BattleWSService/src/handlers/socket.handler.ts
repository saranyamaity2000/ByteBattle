import type { Socket, Server } from "socket.io";
import type { BasicChallengeInfo } from "../types/challenge.type.js";
import { ChallengeDifficulty, ChallengeModel } from "../models/challenge.model.js";
import { problemClient } from "../clients/problem.client.js";
import { challengeService } from "../services/challenge.service.js";
import { socketService } from "../services/socket.service.js";

export type SocketHandler = (socket: Socket, io: Server) => void;

/**
 * TODO : storeChallenge <- service layer <- repository layer
 */
async function storeChallenge(challengeData: {
	challengeId: string;
	challengedFrom: string;
	challengedTo: string;
	problemId: string;
	timeLimitInMin: number;
	difficulty: string;
}): Promise<void> {
	await ChallengeModel.create({ ...challengeData });
}

/**
 * Handles the challenge acceptance flow
 * Redis adapter handles cross-server communication automatically
 */
async function handleChallengeAcceptance(
	socket: Socket,
	io: Server,
	challengeStatus: { challengeId: string; hasAccepted: boolean },
	challengeData: BasicChallengeInfo
): Promise<void> {
	// Join the accepter to the challenge room FIRST
	// (the challenger already joined when they initiated the challenge)
	socket.join(`challenge:${challengeStatus.challengeId}`);

	// Fetch random problem ID from Problem Service
	const problemId: string | null = await problemClient.fetchRandomProblemId({
		difficulty: challengeData.difficulty,
	});
	if (!problemId) {
		console.error("Failed to get random problem ID");
		// Now both users are in the room, so both will receive the error
		io.to(`challenge:${challengeStatus.challengeId}`).emit("match_error", {
			challengeId: challengeStatus.challengeId,
			error: "Failed to fetch problem",
		});
		// Clean up Redis challenge data
		await challengeService.deleteChallengeReq(challengeStatus.challengeId);
		return;
	}

	// Store challenge in db
	await storeChallenge({
		challengeId: challengeStatus.challengeId,
		challengedFrom: challengeData.fromEmail,
		challengedTo: challengeData.toEmail,
		problemId,
		timeLimitInMin: challengeData.timeLimitInMin,
		difficulty: challengeData.difficulty,
	});

	// Prepare match start data
	const matchStartData = {
		challengedBy: challengeData.fromEmail,
		challengedTo: challengeData.toEmail,
		challengeId: challengeStatus.challengeId,
		problemId,
		timeLimitInMin: challengeData.timeLimitInMin,
		difficulty: challengeData.difficulty,
	};

	// Emit match_start to both users in the challenge room
	// Redis adapter ensures this reaches both users even if on different servers
	io.to(`challenge:${challengeStatus.challengeId}`).emit("match_start", matchStartData);

	// Clean up Redis challenge data
	await challengeService.deleteChallengeReq(challengeStatus.challengeId);
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
	challengeReq: BasicChallengeInfo
): Promise<void> {
	// Emit rejection to the challenge room (reaches challenger even on different server)
	io.to(`challenge:${challengeStatus.challengeId}`).emit("challenge-rejected", {
		challengeId: challengeStatus.challengeId,
		rejectedBy: challengeReq.toEmail,
	});

	// Clean up: remove all sockets from the challenge room
	io.in(`challenge:${challengeStatus.challengeId}`).socketsLeave(
		`challenge:${challengeStatus.challengeId}`
	);

	// Clean up Redis challenge data
	await challengeService.deleteChallengeReq(challengeStatus.challengeId);
}

/**
 * Validates if the user is authorized to respond to the challenge
 */
function isUserAuthorizedForChallenge(
	userEmail: string,
	challengeData: BasicChallengeInfo
): boolean {
	return challengeData.toEmail === userEmail;
}

export const handleDisconnect: SocketHandler = (socket, _io) => {
	socket.on("disconnect", async () => {
		console.log("User disconnected:", socket.user.user_metadata.name || socket.user.email);
		await socketService.deleteSocketId(socket.user.email!);
	});
};

export const handleChallenge: SocketHandler = (socket, io) => {
	socket.on(
		"challenge",
		async (challengeReq: {
			challengeToEmail: string;
			timeLimitInMin: number;
			difficulty: ChallengeDifficulty;
		}) => {
			const opponentSocketId: string | null = await socketService.getSocketId(
				challengeReq.challengeToEmail
			);
			if (!socket.user.email || !opponentSocketId) {
				return;
			}
			const challengeId = await challengeService.getUniqueBase62Id();
			await challengeService.storeChallengeReq(challengeId, {
				fromEmail: socket.user.email,
				toEmail: challengeReq.challengeToEmail,
				timeLimitInMin: challengeReq.timeLimitInMin,
				difficulty: challengeReq.difficulty,
			});

			socket.join(`challenge:${challengeId}`);

			io.to(opponentSocketId).emit("challenged", {
				challengedBy: socket.user.email,
				challengeId: `${challengeId}`,
				timeLimitInMin: challengeReq.timeLimitInMin,
				difficulty: challengeReq.difficulty,
			});
		}
	);
};

export const handleChallengeReply: SocketHandler = (socket, io) => {
	socket.on(
		"challenge-reply",
		async (challengeStatus: { challengeId: string; hasAccepted: boolean }) => {
			try {
				// Check if the challenge exists
				const challengeReq = await challengeService.getChallengeReq(
					challengeStatus.challengeId
				);
				if (!challengeReq) {
					return;
				}

				// Check if the user is authorized to respond
				if (!isUserAuthorizedForChallenge(socket.user.email!, challengeReq)) {
					console.log(
						"User not authorized to accept/reject challenge:",
						socket.user.user_metadata.name || socket.user.email,
						"Challenge Id:",
						challengeStatus.challengeId,
						"Challenge Data:",
						challengeReq
					);
					return;
				}

				// Handle rejection
				if (!challengeStatus.hasAccepted) {
					await handleChallengeRejection(io, challengeStatus, challengeReq);
					return;
				}

				// Handle acceptance
				await handleChallengeAcceptance(socket, io, challengeStatus, challengeReq);
			} catch (error) {
				console.error("Error in challenge reply handler:", error);
			}
		}
	);
};
