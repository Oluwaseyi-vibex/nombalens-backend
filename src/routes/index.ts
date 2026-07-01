import { Router } from "express";

import merchantRoutes from "../modules/merchants/merchant.routes.js";
import webhookRoutes from "../modules/webhooks/webhook.routes.js";
import analyticsRoutes from "../modules/analytics/analytics.routes.js";
import insightRoutes from "../modules/insights/insights.routes.js";
import nombaRoutes from "../modules/nomba/nomba.routes.js";

const router = Router();

router.use("/merchants", merchantRoutes);

router.use("/webhooks", webhookRoutes);

router.use("/analytics", analyticsRoutes);

router.use("/insights", insightRoutes);

router.use("/nomba", nombaRoutes);

export default router;
