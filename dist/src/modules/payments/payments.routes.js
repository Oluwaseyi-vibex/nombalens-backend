import { Router } from "express";
import { createPaymentLinkHandler } from "./payments.controller.js";
const router = Router();
router.post("/link", createPaymentLinkHandler);
export default router;
//# sourceMappingURL=payments.routes.js.map