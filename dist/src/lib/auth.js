import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
};
const getRefreshSecret = () => {
    return process.env.JWT_REFRESH_SECRET ?? getJwtSecret();
};
const getAccessTokenTtl = () => process.env.JWT_ACCESS_EXPIRES_IN ?? "1h";
const getRefreshTokenTtl = () => process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";
const accessTokenExpiresInSeconds = () => {
    const ttl = getAccessTokenTtl();
    if (typeof ttl === "number") {
        return ttl;
    }
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) {
        return 3600;
    }
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
        case "s":
            return value;
        case "m":
            return value * 60;
        case "h":
            return value * 3600;
        case "d":
            return value * 86400;
        default:
            return 3600;
    }
};
export const signAccessToken = (merchantId) => {
    return jwt.sign({ merchantId, type: "access" }, getJwtSecret(), {
        expiresIn: getAccessTokenTtl(),
    });
};
export const signRefreshToken = (merchantId, tokenId) => {
    return jwt.sign({ merchantId, type: "refresh", jti: tokenId }, getRefreshSecret(), {
        expiresIn: getRefreshTokenTtl(),
    });
};
export const signMerchantToken = (merchantId, expiresIn = "7d") => {
    return jwt.sign({ merchantId, type: "access" }, getJwtSecret(), { expiresIn });
};
export const createTokenPair = (merchantId, refreshTokenId) => {
    return {
        accessToken: signAccessToken(merchantId),
        refreshToken: signRefreshToken(merchantId, refreshTokenId),
        expiresIn: accessTokenExpiresInSeconds(),
    };
};
export const verifyAccessToken = (token) => {
    const payload = jwt.verify(token, getJwtSecret());
    if (payload.type && payload.type !== "access") {
        throw new Error("Invalid access token");
    }
    const merchantId = payload.merchantId ?? payload.id ?? payload.sub;
    if (!merchantId) {
        throw new Error("Token does not contain merchant identity");
    }
    return { merchantId };
};
export const verifyRefreshToken = (token) => {
    const payload = jwt.verify(token, getRefreshSecret());
    if (payload.type !== "refresh" || !payload.jti) {
        throw new Error("Invalid refresh token");
    }
    const merchantId = payload.merchantId ?? payload.id ?? payload.sub;
    if (!merchantId) {
        throw new Error("Refresh token does not contain merchant identity");
    }
    return { merchantId, tokenId: payload.jti };
};
export const verifyToken = (token) => verifyAccessToken(token);
export const createRefreshTokenId = () => randomUUID();
export const getRefreshTokenExpiry = () => {
    const ttl = getRefreshTokenTtl();
    if (typeof ttl === "number") {
        return new Date(Date.now() + ttl * 1000);
    }
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) {
        return new Date(Date.now() + 30 * 86400 * 1000);
    }
    const value = Number(match[1]);
    const unit = match[2] ?? "d";
    const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return new Date(Date.now() + value * (multipliers[unit] ?? 86_400_000));
};
//# sourceMappingURL=auth.js.map