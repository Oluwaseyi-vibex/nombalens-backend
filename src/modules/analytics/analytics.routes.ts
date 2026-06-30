import { Router } from "express";
import { getWeeklyAnalyticsHandler } from "./analytics.controller.js";

const router = Router();

router.get("/:merchantId/weekly", getWeeklyAnalyticsHandler);

export default router;