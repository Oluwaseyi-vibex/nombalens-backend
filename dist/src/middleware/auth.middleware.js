import { verifyToken } from "../lib/auth.js";
export const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }
    try {
        req.user = verifyToken(token);
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map