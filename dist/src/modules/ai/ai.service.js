import { createLogger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
const log = createLogger("AiService");
const getLuaConfig = () => {
    const apiKey = process.env.LUA_API_KEY;
    const agentId = process.env.LUA_AGENT_ID ?? "nombalens";
    const baseUrl = process.env.LUA_API_BASE_URL ?? "https://api.heylua.ai";
    if (!apiKey) {
        throw new Error("LUA_API_KEY is not configured");
    }
    return { apiKey, agentId, baseUrl };
};
const buildContext = (merchantId) => ({
    merchantId,
    channel: "web",
    timestamp: new Date().toISOString(),
});
const extractToolNames = (toolCalls, toolsUsed) => {
    if (toolsUsed?.length) {
        return toolsUsed;
    }
    if (!toolCalls?.length) {
        return [];
    }
    return toolCalls
        .map((tool) => tool.toolName ?? tool.name)
        .filter((name) => Boolean(name));
};
const parseStreamLine = (line, content, toolsUsed) => {
    const trimmed = line.trim();
    if (!trimmed) {
        return;
    }
    try {
        const chunk = JSON.parse(trimmed);
        if (chunk.type === "text-delta") {
            content.value += chunk.textDelta ?? chunk.text ?? "";
        }
        else if (chunk.type === "text" && chunk.text) {
            content.value += chunk.text;
        }
        else if (chunk.toolsUsed?.length) {
            toolsUsed.value = chunk.toolsUsed;
        }
        else if (chunk.toolCalls?.length) {
            toolsUsed.value = extractToolNames(chunk.toolCalls);
        }
    }
    catch {
        // Ignore malformed stream chunks
    }
};
const streamLuaResponse = async (merchantId, message) => {
    const { apiKey, agentId, baseUrl } = getLuaConfig();
    const context = buildContext(merchantId);
    const start = Date.now();
    const url = new URL(`${baseUrl}/chat/stream/${agentId}`);
    url.searchParams.set("channel", "web");
    url.searchParams.set("identifier", merchantId);
    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages: [{ type: "text", text: message }],
            runtimeContext: JSON.stringify(context),
            clientContext: {
                timezone: process.env.DEFAULT_TIMEZONE ?? "Africa/Lagos",
            },
        }),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Lua stream request failed (${response.status}): ${errorBody}`);
    }
    if (!response.body) {
        throw new Error("Lua stream response has no body");
    }
    const content = { value: "" };
    const toolsUsed = { value: [] };
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
            parseStreamLine(line, content, toolsUsed);
        }
    }
    if (buffer.trim()) {
        parseStreamLine(buffer, content, toolsUsed);
    }
    return {
        content: content.value.trim(),
        toolsUsed: toolsUsed.value,
        responseTimeMs: Date.now() - start,
    };
};
const generateLuaResponse = async (merchantId, message) => {
    const { apiKey, agentId, baseUrl } = getLuaConfig();
    const context = buildContext(merchantId);
    const start = Date.now();
    const url = new URL(`${baseUrl}/chat/generate/${agentId}`);
    url.searchParams.set("channel", "web");
    url.searchParams.set("identifier", merchantId);
    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages: [{ type: "text", text: message }],
            runtimeContext: JSON.stringify(context),
            clientContext: {
                timezone: process.env.DEFAULT_TIMEZONE ?? "Africa/Lagos",
            },
        }),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Lua generate request failed (${response.status}): ${errorBody}`);
    }
    const result = (await response.json());
    return {
        content: (result.text ?? "").trim(),
        toolsUsed: extractToolNames(result.toolCalls, result.toolsUsed),
        responseTimeMs: Date.now() - start,
    };
};
const saveMessage = async (merchantId, role, message) => {
    return prisma.aiConversation.create({
        data: {
            merchantId,
            role,
            message,
        },
    });
};
export const chat = async (merchantId, message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
        throw new Error("Message cannot be empty");
    }
    await saveMessage(merchantId, "user", trimmedMessage);
    let result;
    try {
        result = await streamLuaResponse(merchantId, trimmedMessage);
    }
    catch (streamError) {
        log.warn("Lua stream failed, falling back to generate", {
            merchantId,
            error: streamError instanceof Error ? streamError.message : streamError,
        });
        result = await generateLuaResponse(merchantId, trimmedMessage);
    }
    if (!result.content) {
        throw new Error("Lua returned an empty response");
    }
    await saveMessage(merchantId, "assistant", result.content);
    log.info("AI chat completed", {
        merchantId,
        message: trimmedMessage,
        toolUsed: result.toolsUsed.join(", ") || "none",
        responseTime: result.responseTimeMs,
    });
    return result;
};
export const getConversationHistory = async (merchantId, limit = 50) => {
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const messages = await prisma.aiConversation.findMany({
        where: { merchantId },
        orderBy: { createdAt: "desc" },
        take: safeLimit,
        select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
        },
    });
    return messages.reverse();
};
//# sourceMappingURL=ai.service.js.map