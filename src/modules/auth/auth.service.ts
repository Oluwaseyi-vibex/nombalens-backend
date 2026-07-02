import {
  createRefreshTokenId,
  createTokenPair,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from "../../lib/auth.js";
import { createLogger } from "../../lib/logger.js";
import {
  hashPin,
  hashToken,
  isValidPin,
  verifyPin,
} from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import * as merchantService from "../merchants/merchant.service.js";
import { clearLoginAttempts, isLoginRateLimited } from "./auth.rateLimit.js";
import type {
  AuthTokensResponse,
  LoginInput,
  MerchantProfile,
  RegisterInput,
  SetPinInput,
} from "./auth.types.js";

const log = createLogger("AuthService");

const normalizePhone = (phone: string): string =>
  phone.trim().replace(/\s+/g, "");

const toMerchantProfile = (merchant: {
  id: string;
  businessName: string;
  phone: string;
  subAccountId: string;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
  createdAt: Date;
}): MerchantProfile => ({
  id: merchant.id,
  businessName: merchant.businessName,
  phone: merchant.phone,
  subAccountId: merchant.subAccountId,
  accountNumber: merchant.accountNumber,
  accountName: merchant.accountName,
  bankName: merchant.bankName,
  createdAt: merchant.createdAt,
});

const issueTokens = async (merchantId: string): Promise<AuthTokensResponse> => {
  const merchant = await prisma.merchant.findUniqueOrThrow({
    where: { id: merchantId },
    select: {
      id: true,
      businessName: true,
      phone: true,
      subAccountId: true,
      accountNumber: true,
      accountName: true,
      bankName: true,
      createdAt: true,
    },
  });

  const refreshTokenId = createRefreshTokenId();
  const tokens = createTokenPair(merchantId, refreshTokenId);

  await prisma.refreshToken.create({
    data: {
      id: refreshTokenId,
      merchantId,
      tokenHash: hashToken(tokens.refreshToken),
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    ...tokens,
    merchant: toMerchantProfile(merchant),
  };
};

export const setPin = async (
  input: SetPinInput,
): Promise<AuthTokensResponse> => {
  const phone = normalizePhone(input.phone);
  const pin = input.pin.trim();

  if (!phone || !pin) {
    throw new Error("phone and pin are required");
  }
  if (!isValidPin(pin)) {
    throw new Error("PIN must be 4 to 6 digits");
  }

  const merchant = await prisma.merchant.findUnique({ where: { phone } });
  if (!merchant) {
    throw new Error("Invalid phone number");
  }
  if (merchant.pinHash) {
    throw new Error("PIN already set for this account. Use login instead.");
  }

  const pinHash = await hashPin(pin);
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { pinHash },
  });

  log.info("Merchant set initial PIN", { merchantId: merchant.id, phone });
  return issueTokens(merchant.id);
};

export const register = async (
  input: RegisterInput,
): Promise<AuthTokensResponse> => {
  const phone = normalizePhone(input.phone);
  const businessName = input.businessName.trim();
  const subAccountId = input.subAccountId.trim();
  const pin = input.pin.trim();

  if (!businessName || !phone || !subAccountId) {
    throw new Error("businessName, phone, and subAccountId are required");
  }

  if (!isValidPin(pin)) {
    throw new Error("PIN must be 4 to 6 digits");
  }

  const existingMerchant = await prisma.merchant.findUnique({
    where: { phone },
  });
  if (existingMerchant) {
    throw new Error("A merchant with this phone number already exists");
  }

  const merchant = await merchantService.createMerchant({
    businessName,
    phone,
    subAccountId,
  });

  const pinHash = await hashPin(pin);
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { pinHash },
  });

  log.info("Merchant registered", { merchantId: merchant.id, phone });

  return issueTokens(merchant.id);
};

export const login = async (input: LoginInput): Promise<AuthTokensResponse> => {
  const phone = normalizePhone(input.phone);
  const pin = input.pin.trim();

  if (!phone || !pin) {
    throw new Error("phone and pin are required");
  }

  if (isLoginRateLimited(phone)) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  const merchant = await prisma.merchant.findUnique({ where: { phone } });
  if (!merchant?.pinHash) {
    throw new Error("Invalid phone or PIN");
  }

  if (!merchant.pinHash) {
    throw new Error("PIN_NOT_SET"); // let the client catch this and route to /set-pin
  }

  const pinMatches = await verifyPin(pin, merchant.pinHash);
  if (!pinMatches) {
    throw new Error("Invalid phone or PIN");
  }

  clearLoginAttempts(phone);
  log.info("Merchant logged in", { merchantId: merchant.id, phone });

  return issueTokens(merchant.id);
};

export const refresh = async (
  refreshToken: string,
): Promise<AuthTokensResponse> => {
  const trimmedToken = refreshToken.trim();
  if (!trimmedToken) {
    throw new Error("refreshToken is required");
  }

  const { merchantId, tokenId } = verifyRefreshToken(trimmedToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { id: tokenId },
  });

  if (
    !storedToken ||
    storedToken.merchantId !== merchantId ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= new Date() ||
    storedToken.tokenHash !== hashToken(trimmedToken)
  ) {
    throw new Error("Invalid or expired refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });

  return issueTokens(merchantId);
};

export const logout = async (refreshToken: string): Promise<void> => {
  const trimmedToken = refreshToken.trim();
  if (!trimmedToken) {
    return;
  }

  try {
    const { merchantId, tokenId } = verifyRefreshToken(trimmedToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });

    if (
      storedToken &&
      storedToken.merchantId === merchantId &&
      !storedToken.revokedAt &&
      storedToken.tokenHash === hashToken(trimmedToken)
    ) {
      await prisma.refreshToken.update({
        where: { id: tokenId },
        data: { revokedAt: new Date() },
      });
    }
  } catch {
    // Ignore invalid tokens on logout
  }
};

export const getProfile = async (
  merchantId: string,
): Promise<MerchantProfile> => {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      businessName: true,
      phone: true,
      subAccountId: true,
      accountNumber: true,
      accountName: true,
      bankName: true,
      createdAt: true,
    },
  });

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  return toMerchantProfile(merchant);
};
