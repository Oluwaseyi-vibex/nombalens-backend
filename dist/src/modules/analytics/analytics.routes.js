import { Router } from "express";
import { getSummaryAnalyticsHandler, getWeeklyAnalyticsHandler, getBusinessHealthHandler, } from "./analytics.controller.js";
const router = Router();
router.get("/:merchantId/summary", getSummaryAnalyticsHandler);
router.get("/:merchantId/health", getBusinessHealthHandler);
router.get("/:merchantId/weekly", getWeeklyAnalyticsHandler);
export default router;
//# sourceMappingURL=analytics.routes.js.map