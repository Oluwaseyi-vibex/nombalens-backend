import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./app.js";
import { setupAiSocket } from "./modules/ai/ai.socket.js";
dotenv.config();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    path: "/api/v1/ai/chat",
    cors: {
        origin: process.env.CORS_ORIGIN ?? "*",
        methods: ["GET", "POST"],
    },
});
setupAiSocket(io);
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🤖 AI chat WebSocket path: /api/v1/ai/chat`);
});
const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down server...`);
    io.close(() => {
        httpServer.close(() => {
            process.exit(0);
        });
    });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
//# sourceMappingURL=server.js.map