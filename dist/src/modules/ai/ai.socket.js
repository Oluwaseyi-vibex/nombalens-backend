import { verifyToken } from "../../lib/auth.js";
import { createLogger } from "../../lib/logger.js";
import { isRateLimited } from "./ai.rateLimit.js";
import * as aiService from "./ai.service.js";
const log = createLogger("AiSocket");
const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        next(new Error("Authentication required"));
        return;
    }
    try {
        const user = verifyToken(token);
        socket.data.merchantId = user.merchantId;
        next();
    }
    catch {
        next(new Error("Invalid or expired token"));
    }
};
const handleAiMessage = async (socket, payload) => {
    const merchantId = socket.data.merchantId;
    if (!merchantId) {
        socket.emit("ai", { message: "Unable to process request." });
        return;
    }
    const message = payload?.message?.trim();
    if (!message) {
        socket.emit("ai", { message: "Unable to process request." });
        return;
    }
    if (isRateLimited(merchantId)) {
        socket.emit("ai", { message: "Rate limit exceeded. Please wait before sending more messages." });
        return;
    }
    try {
        const result = await aiService.chat(merchantId, message);
        socket.emit("ai", { content: result.content });
    }
    catch (error) {
        log.error("Failed to process AI chat message", error, { merchantId, message });
        socket.emit("ai", { message: "Unable to process request." });
    }
};
export const setupAiSocket = (io) => {
    io.use(authenticateSocket);
    io.on("connection", (socket) => {
        const merchantId = socket.data.merchantId;
        log.info("AI chat socket connected", { merchantId, socketId: socket.id });
        socket.on("ai", (payload) => {
            void handleAiMessage(socket, payload);
        });
        socket.on("disconnect", (reason) => {
            log.info("AI chat socket disconnected", { merchantId, socketId: socket.id, reason });
        });
    });
};
//# sourceMappingURL=ai.socket.js.map