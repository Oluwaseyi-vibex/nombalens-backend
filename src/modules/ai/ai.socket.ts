import type { Server, Socket } from "socket.io";
import { verifyToken } from "../../lib/auth.js";
import { createLogger } from "../../lib/logger.js";
import { isRateLimited } from "./ai.rateLimit.js";
import * as aiService from "./ai.service.js";
import type { ClientAiMessage } from "./ai.types.js";

const log = createLogger("AiSocket");

interface AuthenticatedSocket extends Socket {
  data: {
    merchantId?: string;
  };
}

const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void): void => {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    const user = verifyToken(token);
    socket.data.merchantId = user.merchantId;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
};

const handleAiMessage = async (socket: AuthenticatedSocket, payload: ClientAiMessage): Promise<void> => {
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
  } catch (error) {
    log.error("Failed to process AI chat message", error, { merchantId, message });
    socket.emit("ai", { message: "Unable to process request." });
  }
};

export const setupAiSocket = (io: Server): void => {
  io.use(authenticateSocket);

  io.on("connection", (socket: AuthenticatedSocket) => {
    const merchantId = socket.data.merchantId;
    log.info("AI chat socket connected", { merchantId, socketId: socket.id });

    socket.on("ai", (payload: ClientAiMessage) => {
      void handleAiMessage(socket, payload);
    });

    socket.on("disconnect", (reason) => {
      log.info("AI chat socket disconnected", { merchantId, socketId: socket.id, reason });
    });
  });
};
