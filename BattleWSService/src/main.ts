import { createServer } from "http";
import { Server } from "socket.io";
import { serverConfig } from "./config/server.config.js";

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	console.log("User connected:", socket.id);
	socket.on("message", (data) => {
		io.emit("message", data);
	});
});

httpServer.listen(serverConfig.PORT, () => {
	// tribute to 101 switching protocols :)
	console.log(`WebSocket server running on ws://localhost:${serverConfig.PORT}`);
});
