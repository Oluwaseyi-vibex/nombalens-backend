import {} from "express";
import * as webhookService from "./webhook.service.js";
export const receiveWebhookHandler = async (req, res) => {
    try {
        const payload = req.body;
        if (payload.event_type === "payment_success") {
            await webhookService.handlePaymentSuccess(payload);
        }
        return res.status(200).json({
            success: true,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
        });
    }
};
//# sourceMappingURL=webhook.controller.js.map