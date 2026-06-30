const LOG_LEVEL = (process.env.LOG_LEVEL || "INFO").toUpperCase();
const levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};
const shouldLog = (level) => levels[level] >= levels[LOG_LEVEL];
const format = (level, context, message, meta) => {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level}] [${context}] ${message}`;
    return meta ? `${base} ${JSON.stringify(meta)}` : base;
};
export const createLogger = (context) => ({
    info: (message, meta) => {
        if (shouldLog("INFO"))
            console.log(format("INFO", context, message, meta));
    },
    warn: (message, meta) => {
        if (shouldLog("WARN"))
            console.warn(format("WARN", context, message, meta));
    },
    error: (message, error, meta) => {
        if (shouldLog("ERROR")) {
            const errMeta = error instanceof Error
                ? { ...meta, error: error.message, stack: error.stack }
                : { ...meta, error };
            console.error(format("ERROR", context, message, errMeta));
        }
    },
    debug: (message, meta) => {
        if (shouldLog("DEBUG"))
            console.log(format("DEBUG", context, message, meta));
    },
});
//# sourceMappingURL=logger.js.map