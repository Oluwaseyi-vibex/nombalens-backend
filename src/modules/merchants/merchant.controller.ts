import { type Request, type Response } from "express";
import * as merchantService from "./merchant.service.js";
import { createLogger } from "../../lib/logger.js";

const log = createLogger("MerchantController");

export const createMerchantHandler = async (req: Request, res: Response) => {
    try {
        log.info("Received create merchant request", { body: req.body });
        const merchant = await merchantService.createMerchant(req.body);

        return res.status(201).json({
            success: true,
            data: merchant,
        });
    } catch (error) {
        log.error("Failed to create merchant", error, { body: req.body });
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return res.status(500).json({
            success: false,
            message: "Failed to create merchant",
            error: errorMessage,
        });
    }
};