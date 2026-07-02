const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;
const loginAttempts = new Map();
export const isLoginRateLimited = (phone) => {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const key = phone.toLowerCase();
    const attempts = (loginAttempts.get(key) ?? []).filter((ts) => ts > windowStart);
    if (attempts.length >= MAX_ATTEMPTS) {
        loginAttempts.set(key, attempts);
        return true;
    }
    attempts.push(now);
    loginAttempts.set(key, attempts);
    return false;
};
export const clearLoginAttempts = (phone) => {
    loginAttempts.delete(phone.toLowerCase());
};
//# sourceMappingURL=auth.rateLimit.js.map