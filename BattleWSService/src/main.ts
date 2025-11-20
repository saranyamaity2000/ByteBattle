import { createServer } from "http";
import { Server } from "socket.io";
import { serverConfig } from "./config/server.config.js";
import { createClient, type User } from "@supabase/supabase-js";
import {
	handleDisconnect,
	handleChallenge,
	handleChallengeReply,
} from "./handlers/socket.handler.js";
import { redisClient } from "./clients/redis.client.js";
import mongoose from "mongoose";
import express from "express";
import { createAdapter } from "@socket.io/redis-adapter";

declare module "socket.io" {
	interface Socket {
		user: User;
	}
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		allowedHeaders: ["*"],
	},
	adapter: createAdapter(redisClient.publisher, redisClient.subscriber, {
		key: `${serverConfig.APP_NAME}:${serverConfig.NODE_ENV}`, // to make sure ioredis's publishing and subscribing keys are unique per app and environment
	}),
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
			redisClient.publisher.set(`email:${socket.user.email}`, socket.id);
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

(async () => {
	try {
		await mongoose.connect(serverConfig.MONGO_URI);
		console.log("MongoDB connected successfully");
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
	httpServer.listen(serverConfig.PORT, () => {
		console.log(`SocketIO server running on ws://localhost:${serverConfig.PORT}`);
	});
})();
