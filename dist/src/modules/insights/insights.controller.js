import {} from "express";
import { getMerchantIdFromRequest } from "../../lib/merchantContext.js";
import * as insightsService from "./insights.service.js";
export const generateInsightsHandler = async (req, res) => {
    try {
        const merchantId = getMerchantIdFromRequest(req);
        if (!merchantId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const result = await insightsService.generateInsights(merchantId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate insights",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
export const getInsightsHandler = async (req, res) => {
    try {
        const merchantId = getMerchantIdFromRequest(req);
        if (!merchantId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const result = await insightsService.getInsights(merchantId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load insights",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
//# sourceMappingURL=insights.controller.js.map