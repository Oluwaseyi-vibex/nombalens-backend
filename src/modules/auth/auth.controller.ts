import type { Request, Response } from "express";
import { createLogger } from "../../lib/logger.js";
import * as authService from "./auth.service.js";

const log = createLogger("AuthController");

const getErrorStatus = (message: string): number => {
  if (message.includes("already exists")) {
    return 409;
  }

  if (
    message.includes("Invalid phone or PIN") ||
    message.includes("Invalid or expired refresh token") ||
    message.includes("refreshToken is required")
  ) {
    return 401;
  }

  if (message.includes("Too many login attempts")) {
    return 429;
  }

  if (message.includes("required") || message.includes("PIN must")) {
    return 400;
  }

  if (message.includes("not found")) {
    return 404;
  }

  return 500;
};

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    log.error("Registration failed", error, { body: req.body });

    return res.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    log.error("Login failed", error);

    return res.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
};

export const refreshHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken as string | undefined;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "refreshToken is required",
      });
    }

    const result = await authService.refresh(refreshToken);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token refresh failed";

    return res.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
};

export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken as string | undefined;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    log.error("Logout failed", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const meHandler = async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const merchant = await authService.getProfile(merchantId);

    return res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile";

    return res.status(getErrorStatus(message)).json({
      success: false,
      message,
    });
  }
};
