import {} from "express";
import * as insightsService from "./insights.service.js";
export const generateInsightsHandler = async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
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
        const merchantId = req.params.merchantId;
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