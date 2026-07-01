import { type Request, type Response } from "express";
import * as insightsService from "./insights.service.js";

export const generateInsightsHandler = async (req: Request, res: Response) => {
  try {
    const merchantId = req.params.merchantId as string;
    const result = await insightsService.generateInsights(merchantId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate insights",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getInsightsHandler = async (req: Request, res: Response) => {
  try {
    const merchantId = req.params.merchantId as string;
    const result = await insightsService.getInsights(merchantId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load insights",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
