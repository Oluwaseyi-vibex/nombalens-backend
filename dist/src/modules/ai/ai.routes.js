import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getChatHistoryHandler } from "./ai.controller.js";
const router = Router();
router.get("/history", authenticate, getChatHistoryHandler);
export default router;
//# sourceMappingURL=ai.routes.js.map