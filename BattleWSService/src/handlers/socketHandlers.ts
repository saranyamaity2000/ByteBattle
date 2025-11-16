import type { Socket, Server } from "socket.io";
import { redisService } from "../services/redis-service.js";
import type { ChallengeData } from "../types/challange.js";

export type SocketHandler = (socket: Socket, io: Server) => void;

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
			// check if the challenge exists
			const challengeDataStr = await redisService.subscriber.get(
				`challenge:${challangeStatus.challangeId}`
			);
			if (!challengeDataStr) {
				return;
			}
			// check if the challenge is for the user
			const challengeData = JSON.parse(challengeDataStr) as ChallengeData;
			if (challengeData.toEmail !== socket.user.email) {
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
			// if the challenge is rejected
			if (!challangeStatus.hasAccepted) {
				redisService.subscriber.del(`challenge:${challangeStatus.challangeId}`);
				io.to(challengeData.fromEmail).emit("challenge-rejected", {
					challengeId: challangeStatus.challangeId,
				});
				const socketId: string | null = await redisService.subscriber.get(
					`email:${challengeData.fromEmail}`
				);
				if (socketId) {
					io.to(socketId).socketsLeave(`challenge:${challangeStatus.challangeId}`);
				}
				return;
			}
			// if the challenge is accepted
			const opponentSocketId: string | null = await redisService.subscriber.get(
				`email:${challengeData.fromEmail}`
			);
			if (!opponentSocketId) {
				console.log(`User ${challengeData.fromEmail} not connected anymore!`);
				return;
			}
			socket.join(`challenge:${challangeStatus.challangeId}`);
			io.to(opponentSocketId).emit("challenge-start", {
				challangedBy: challengeData.fromEmail,
				challengedTo: challengeData.toEmail,
				challengeId: challangeStatus.challangeId,
			});
			redisService.subscriber.del(`challenge:${challangeStatus.challangeId}`);
		}
	);
};
