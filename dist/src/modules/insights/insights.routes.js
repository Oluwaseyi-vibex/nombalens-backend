import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireInternalService } from "../../middleware/internalService.middleware.js";
import { generateInsightsHandler, getInsightsHandler, } from "./insights.controller.js";
const router = Router();
router.get("/", authenticate, getInsightsHandler);
router.post("/generate", authenticate, generateInsightsHandler);
router.get("/:merchantId", requireInternalService, getInsightsHandler);
router.post("/:merchantId/generate", requireInternalService, generateInsightsHandler);
export default router;
//# sourceMappingURL=insights.routes.js.map