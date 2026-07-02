import type { Request, Response } from "express";
import * as aiService from "./ai.service.js";

export const getChatHistoryHandler = async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const limit = Number(req.query.limit ?? 50);
    const history = await aiService.getConversationHistory(merchantId, Number.isFinite(limit) ? limit : 50);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load chat history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
