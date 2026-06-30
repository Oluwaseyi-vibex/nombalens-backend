import { type Request, type Response } from "express";
import * as merchantService from "./merchant.service.js";

export const createMerchantHandler = async (req: Request, res: Response) => {
    try {
        const merchant = await merchantService.createMerchant(req.body);

        return res.status(201).json({
            success: true,
            data: merchant,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create merchant",
        });
    }
};