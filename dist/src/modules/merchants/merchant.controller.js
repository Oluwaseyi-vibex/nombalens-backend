import {} from "express";
import * as merchantService from "./merchant.service.js";
export const createMerchantHandler = async (req, res) => {
    try {
        const merchant = await merchantService.createMerchant(req.body);
        return res.status(201).json({
            success: true,
            data: merchant,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create merchant",
        });
    }
};
//# sourceMappingURL=merchant.controller.js.map