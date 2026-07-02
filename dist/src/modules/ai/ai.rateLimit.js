const WINDOW_MS = 60_000;
const MAX_MESSAGES = 10;
const messageTimestamps = new Map();
export const isRateLimited = (merchantId) => {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const timestamps = (messageTimestamps.get(merchantId) ?? []).filter((ts) => ts > windowStart);
    if (timestamps.length >= MAX_MESSAGES) {
        messageTimestamps.set(merchantId, timestamps);
        return true;
    }
    timestamps.push(now);
    messageTimestamps.set(merchantId, timestamps);
    return false;
};
export const resetRateLimit = (merchantId) => {
    messageTimestamps.delete(merchantId);
};
//# sourceMappingURL=ai.rateLimit.js.map