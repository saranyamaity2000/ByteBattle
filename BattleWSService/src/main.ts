import { createServer } from "http";
import { Server } from "socket.io";
import { serverConfig } from "./config/server.config.js";
import { createClient, type User } from "@supabase/supabase-js";
import {
	handleDisconnect,
	handleChallenge,
	handleChallengeReply,
} from "./handlers/socketHandlers.js";
import { redisService } from "./services/redis-service.js";

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
			redisService.publisher.set(`email:${socket.user.email}`, socket.id);
		}
		next();
	} catch (err) {
		return next(new Error("Authentication error"));
	}
});

// Connection handler
io.on("connection", (socket) => {
	console.log("User connected:", socket.user.user_metadata.name || socket.user.email);
	handleDisconnect(socket, io);
	handleChallenge(socket, io);
	handleChallengeReply(socket, io);
});

httpServer.listen(serverConfig.PORT, () => {
	console.log(`SocketIO server running on ws://localhost:${serverConfig.PORT}`);
});
