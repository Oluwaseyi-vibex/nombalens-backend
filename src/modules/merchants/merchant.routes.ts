import { Router } from "express";
import { createMerchantHandler } from "./merchant.controller.js";

const router = Router();

router.post("/", createMerchantHandler);

export default router;