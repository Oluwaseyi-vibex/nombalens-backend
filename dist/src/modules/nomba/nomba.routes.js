import { Router } from "express";
import { getParentAccountHandler, getSubAccountBalanceHandler, getSubAccountDetailsHandler, } from "./nomba.controller.js";
const router = Router();
router.get("/accounts/parent", getParentAccountHandler);
router.get("/accounts/sub-account-details", getSubAccountDetailsHandler);
router.get("/accounts/:subAccountId/balance", getSubAccountBalanceHandler);
export default router;
//# sourceMappingURL=nomba.routes.js.map