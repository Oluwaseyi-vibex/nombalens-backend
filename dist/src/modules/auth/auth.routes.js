import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { loginHandler, logoutHandler, meHandler, refreshHandler, registerHandler, } from "./auth.controller.js";
const router = Router();
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.get("/me", authenticate, meHandler);
export default router;
//# sourceMappingURL=auth.routes.js.map