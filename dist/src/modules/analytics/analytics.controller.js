import {} from "express";
import { getMerchantIdFromRequest } from "../../lib/merchantContext.js";
import * as analyticsService from "./analytics.service.js";
export const getWeeklyAnalyticsHandler = async (req, res) => {
    try {
        const merchantId = getMerchantIdFromRequest(req);
        if (!merchantId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const result = await analyticsService.getWeeklyRevenue(merchantId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch analytics",
        });
    }
};
export const getSummaryAnalyticsHandler = async (req, res) => {
    try {
        const merchantId = getMerchantIdFromRequest(req);
        if (!merchantId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const result = await analyticsService.getSummaryAnalytics(merchantId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch analytics summary",
        });
    }
};
export const getBusinessHealthHandler = async (req, res) => {
    try {
        const merchantId = getMerchantIdFromRequest(req);
        if (!merchantId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const result = await analyticsService.getBusinessHealth(merchantId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch business health",
        });
    }
};
//# sourceMappingURL=analytics.controller.js.map