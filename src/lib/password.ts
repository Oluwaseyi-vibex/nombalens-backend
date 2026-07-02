import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const PIN_PATTERN = /^\d{4,6}$/;

export const isValidPin = (pin: string): boolean => PIN_PATTERN.test(pin);

export const hashPin = async (pin: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(pin, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPin = async (pin: string, storedHash: string): Promise<boolean> => {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }

  const derivedKey = (await scryptAsync(pin, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
};

export const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};
