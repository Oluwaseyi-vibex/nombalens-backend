import { type Request, type Response } from "express";
import * as analyticsService from "./analytics.service.js";

export const getWeeklyAnalyticsHandler = async (req: Request, res: Response) => {
    try {
        const merchantId = req.params.merchantId as string;

        const result = await analyticsService.getWeeklyRevenue(merchantId);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch analytics",
        });
    }
};