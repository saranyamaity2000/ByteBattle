import { createServer } from "http";
import { Server } from "socket.io";
import { serverConfig } from "./config/server.config.js";
import { createClient, type User } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";

declare module "socket.io" {
	interface Socket {
		user: User;
	}
}

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		allowedHeaders: ["*"],
	},
});

// Auth middleware
io.use(async (socket, next) => {
	const token = socket.handshake.auth.token;
	try {
		const {
			data: { user },
			error,
		} = await createClient(
			serverConfig.SUPABASE_URL,
			serverConfig.SUPABASE_API_KEY
		).auth.getUser(token);
		if (!user || error) {
			return next(new Error("Authentication error"));
		}
		socket.user = user;
		if (socket.user.email) {
			emailToSocketIdMap.set(socket.user.email, socket.id);
		}
		next();
	} catch (err) {
		return next(new Error("Authentication error"));
	}
});

const emailToSocketIdMap = new Map<string, string>();
const challangeIdToChallangedByMap = new Map<string, string>();

// Connection handler
io.on("connection", (socket) => {
	console.log("User connected:", socket.user.user_metadata.name || socket.user.email);

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.user.user_metadata.name || socket.user.email);
	});

	socket.on("challenge", ({ chanllangeToEmail }: { chanllangeToEmail: string }) => {
		console.log(
			"User challenged:",
			socket.user.user_metadata.name || socket.user.email,
			"to",
			chanllangeToEmail
		);
		if (socket.user.email && emailToSocketIdMap.has(chanllangeToEmail)) {
			const challengeId = uuid();
			challangeIdToChallangedByMap.set(challengeId, socket.user.email);
			socket.join(challengeId);
			console.log("Challenge Id:", challengeId);
			console.log("opponent socket id:", emailToSocketIdMap.get(chanllangeToEmail));
			io.to(emailToSocketIdMap.get(chanllangeToEmail)!).emit("challenged", {
				challangedBy: socket.user.email,
				challengeId,
			});
		}
	});

	socket.on(
		"accept-challenge-status",
		(challangeStatus: { challangeId: string; hasAccepted: boolean }) => {
			if (challangeStatus.hasAccepted) {
				console.log(
					"User accepted challenge:",
					socket.user.user_metadata.name || socket.user.email
				);
				if (challangeIdToChallangedByMap.has(challangeStatus.challangeId)) {
					socket.join(challangeStatus.challangeId);
					// now emit a event for the room
					io.to(challangeStatus.challangeId).emit("challengeAccepted", {
						challangedBy: socket.user.email,
						challengeId: challangeStatus.challangeId,
					});
				} else {
					console.log("Challenge Id not found");
				}
			} else {
				console.log(
					"User rejected challenge:",
					socket.user.user_metadata.name || socket.user.email
				);
			}
		}
	);
});

httpServer.listen(serverConfig.PORT, () => {
	console.log(`SocketIO server running on ws://localhost:${serverConfig.PORT}`);
});
