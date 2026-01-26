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
import cors from "cors";
import v1Router from "./routers/v1/index.router.js";
import { initializeSupabase } from "./middlewares/auth.middleware.js";
import challengeService from "./services/challenge.service.js";

declare module "socket.io" {
	interface Socket {
		user: User;
	}
}
declare module "express-serve-static-core" {
	interface Request {
		user?: User;
	}
}

const app = express();
app.use(
	cors({
		origin: serverConfig.ALLOWED_ORIGINS,
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // without explicit mentioning header, will get CORs error
	}),
);
app.use(express.json());
app.use("/api/v1", v1Router);

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
			serverConfig.SUPABASE_API_KEY,
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
	// initialize supabase
	initializeSupabase(serverConfig.SUPABASE_URL, serverConfig.SUPABASE_API_KEY);
	// attach io to socket service
	challengeService.attachIO(io);
	try {
		await mongoose.connect(serverConfig.MONGO_URI);
		console.log("MongoDB connected successfully");
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
	httpServer.listen(serverConfig.PORT, () => {
		console.log(`SocketIO server running on ws://localhost:${serverConfig.PORT}`);
		console.log(`normal http server running on http://localhost:${serverConfig.PORT}`);
	});
})();
