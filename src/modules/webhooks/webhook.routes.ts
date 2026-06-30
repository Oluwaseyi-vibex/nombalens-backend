import { Router } from "express";
import { receiveWebhookHandler } from "./webhook.controller.js";

const router = Router();

router.post("/nomba", receiveWebhookHandler);

export default router;