import { Router } from "express";
import {
  generateInsightsHandler,
  getInsightsHandler,
} from "./insights.controller.js";

const router = Router();

router.post("/:merchantId/generate", generateInsightsHandler);
router.get("/:merchantId", getInsightsHandler);

export default router;
