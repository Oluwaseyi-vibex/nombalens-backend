import {} from "express";
import * as analyticsService from "./analytics.service.js";
export const getWeeklyAnalyticsHandler = async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const result = await analyticsService.getWeeklyRevenue(merchantId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch analytics",
        });
    }
};
//# sourceMappingURL=analytics.controller.js.map