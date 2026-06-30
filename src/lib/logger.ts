type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

const LOG_LEVEL = (process.env.LOG_LEVEL || "INFO").toUpperCase() as LogLevel;

const levels: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

const shouldLog = (level: LogLevel): boolean => levels[level] >= levels[LOG_LEVEL];

const format = (level: LogLevel, context: string, message: string, meta?: object): string => {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level}] [${context}] ${message}`;
    return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

export const createLogger = (context: string) => ({
    info: (message: string, meta?: object) => {
        if (shouldLog("INFO")) console.log(format("INFO", context, message, meta));
    },
    warn: (message: string, meta?: object) => {
        if (shouldLog("WARN")) console.warn(format("WARN", context, message, meta));
    },
    error: (message: string, error?: unknown, meta?: object) => {
        if (shouldLog("ERROR")) {
            const errMeta = error instanceof Error
                ? { ...meta, error: error.message, stack: error.stack }
                : { ...meta, error };
            console.error(format("ERROR", context, message, errMeta));
        }
    },
    debug: (message: string, meta?: object) => {
        if (shouldLog("DEBUG")) console.log(format("DEBUG", context, message, meta));
    },
});
