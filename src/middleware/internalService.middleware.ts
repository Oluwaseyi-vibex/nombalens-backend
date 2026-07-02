import type { NextFunction, Request, Response } from "express";

export const requireInternalService = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers["x-internal-api-key"];
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey) {
    res.status(503).json({
      success: false,
      message: "Internal service authentication is not configured",
    });
    return;
  }

  if (apiKey !== expectedKey) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const merchantId = req.params.merchantId;
  if (!merchantId) {
    res.status(400).json({
      success: false,
      message: "merchantId is required",
    });
    return;
  }

  next();
};
