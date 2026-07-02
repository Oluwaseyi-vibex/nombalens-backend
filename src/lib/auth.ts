import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

export interface AuthUser {
  merchantId: string;
}

export interface JwtPayload {
  merchantId?: string;
  id?: string;
  sub?: string;
  type?: "access" | "refresh";
  jti?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

const getRefreshSecret = (): string => {
  return process.env.JWT_REFRESH_SECRET ?? getJwtSecret();
};

const getAccessTokenTtl = (): string | number => process.env.JWT_ACCESS_EXPIRES_IN ?? "1h";
const getRefreshTokenTtl = (): string | number => process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";

const accessTokenExpiresInSeconds = (): number => {
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

export const signAccessToken = (merchantId: string): string => {
  return jwt.sign({ merchantId, type: "access" }, getJwtSecret(), {
    expiresIn: getAccessTokenTtl(),
  } as jwt.SignOptions);
};

export const signRefreshToken = (merchantId: string, tokenId: string): string => {
  return jwt.sign({ merchantId, type: "refresh", jti: tokenId }, getRefreshSecret(), {
    expiresIn: getRefreshTokenTtl(),
  } as jwt.SignOptions);
};

export const signMerchantToken = (merchantId: string, expiresIn: string | number = "7d"): string => {
  return jwt.sign({ merchantId, type: "access" }, getJwtSecret(), { expiresIn } as jwt.SignOptions);
};

export const createTokenPair = (merchantId: string, refreshTokenId: string): TokenPair => {
  return {
    accessToken: signAccessToken(merchantId),
    refreshToken: signRefreshToken(merchantId, refreshTokenId),
    expiresIn: accessTokenExpiresInSeconds(),
  };
};

export const verifyAccessToken = (token: string): AuthUser => {
  const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;

  if (payload.type && payload.type !== "access") {
    throw new Error("Invalid access token");
  }

  const merchantId = payload.merchantId ?? payload.id ?? payload.sub;
  if (!merchantId) {
    throw new Error("Token does not contain merchant identity");
  }

  return { merchantId };
};

export const verifyRefreshToken = (token: string): { merchantId: string; tokenId: string } => {
  const payload = jwt.verify(token, getRefreshSecret()) as JwtPayload;

  if (payload.type !== "refresh" || !payload.jti) {
    throw new Error("Invalid refresh token");
  }

  const merchantId = payload.merchantId ?? payload.id ?? payload.sub;
  if (!merchantId) {
    throw new Error("Refresh token does not contain merchant identity");
  }

  return { merchantId, tokenId: payload.jti };
};

export const verifyToken = (token: string): AuthUser => verifyAccessToken(token);

export const createRefreshTokenId = (): string => randomUUID();

export const getRefreshTokenExpiry = (): Date => {
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
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

  return new Date(Date.now() + value * (multipliers[unit] ?? 86_400_000));
};
