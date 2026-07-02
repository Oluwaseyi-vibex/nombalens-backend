import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireInternalService } from "../../middleware/internalService.middleware.js";
import { getSummaryAnalyticsHandler, getWeeklyAnalyticsHandler, getBusinessHealthHandler, } from "./analytics.controller.js";
const router = Router();
router.get("/summary", authenticate, getSummaryAnalyticsHandler);
router.get("/health", authenticate, getBusinessHealthHandler);
router.get("/weekly", authenticate, getWeeklyAnalyticsHandler);
router.get("/:merchantId/summary", requireInternalService, getSummaryAnalyticsHandler);
router.get("/:merchantId/health", requireInternalService, getBusinessHealthHandler);
router.get("/:merchantId/weekly", requireInternalService, getWeeklyAnalyticsHandler);
export default router;
//# sourceMappingURL=analytics.routes.js.map