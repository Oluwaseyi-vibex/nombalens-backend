import { type Request, type Response } from "express";
import { createPaymentLink } from "./payments.service.js";

export const createPaymentLinkHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      merchantId,
      amount,
      currency,
      description,
      redirectUrl,
      customerName,
      customerEmail,
    } = req.body;

    if (!merchantId || typeof merchantId !== "string") {
      res.status(400).json({ success: false, error: "merchantId is required" });
      return;
    }

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      res
        .status(400)
        .json({ success: false, error: "amount must be a positive number" });
      return;
    }

    const paymentLink = await createPaymentLink({
      merchantId,
      amount,
      currency,
      description,
      redirectUrl,
      customerName,
      customerEmail,
    });

    res.status(201).json({ success: true, data: paymentLink });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error creating payment link";
    res.status(500).json({ success: false, error: message });
  }
};
