import { Router } from "express";

import merchantRoutes from "../modules/merchants/merchant.routes.js";
import webhookRoutes from "../modules/webhooks/webhook.routes.js";
import analyticsRoutes from "../modules/analytics/analytics.routes.js";

const router = Router();

router.use("/merchants", merchantRoutes);

router.use("/webhooks", webhookRoutes);

router.use("/analytics", analyticsRoutes);

export default router;