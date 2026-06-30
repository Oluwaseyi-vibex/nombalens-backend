import { type Request, type Response } from "express";
import crypto from "crypto";
import * as webhookService from "./webhook.service.js";

export const receiveWebhookHandler = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const secret = process.env.NOMBA_SECRET_KEY;
        const signatureValue = req.headers["nomba-signature"] as string;
        const nombaTimeStamp = req.headers["nomba-timestamp"] as string;

        // Signature Validation
        if (secret && signatureValue && nombaTimeStamp) {
            const data = payload.data || {};
            const merchant = data.merchant || {};
            const transaction = data.transaction || {};

            const eventType = payload.event_type || "";
            const requestId = payload.requestId || "";
            const userId = merchant.userId || "";
            const walletId = merchant.walletId || "";
            const transactionId = transaction.transactionId || "";
            const transactionType = transaction.type || "";
            const transactionTime = transaction.time || "";
            let transactionResponseCode = transaction.responseCode || "";

            if (transactionResponseCode === "null") {
                transactionResponseCode = "";
            }

            const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${transactionResponseCode}:${nombaTimeStamp}`;

            const hmac = crypto.createHmac("sha256", secret);
            hmac.update(hashingPayload);
            const mySig = hmac.digest("base64");

            if (signatureValue.toLowerCase() !== mySig.toLowerCase()) {
                console.error("Invalid Nomba Webhook Signature:", { expected: mySig, received: signatureValue });
                return res.status(401).json({
                    success: false,
                    message: "Invalid webhook signature. Request rejected.",
                });
            }
        } else if (!secret) {
            console.warn("NOMBA_SECRET_KEY is not set. Skipping webhook signature verification. THIS IS INSECURE.");
        } else {
             return res.status(400).json({
                 success: false,
                 message: "Missing webhook signature headers",
             });
        }

        // Event Processing
        if (payload.event_type === "payment_success") {
            await webhookService.handlePaymentSuccess(payload);
            return res.status(200).json({
                success: true,
                message: "Payment success event processed successfully",
            });
        }

        // Unhandled Events
        console.info(`Received unhandled webhook event: ${payload.event_type}`);
        return res.status(200).json({
            success: true,
            message: `Event type '${payload.event_type}' received but no specific handler implemented.`,
        });

    } catch (error) {
        console.error("Webhook Error Processing Event:", error);
        
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        
        return res.status(500).json({
            success: false,
            message: "Internal server error while processing webhook",
            error: errorMessage,
        });
    }
};