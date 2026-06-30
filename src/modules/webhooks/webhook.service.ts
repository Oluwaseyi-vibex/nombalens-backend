import { prisma } from "../../lib/prisma.js";

export const handlePaymentSuccess = async (payload: any) => {
    const data = payload.data || {};
    const isNested = data.transaction !== undefined;

    let id, subAccountId, amount, senderName, narration, transactionDate;

    if (isNested) {
        // Nomba V2 / Nested structure (from Docs)
        const transaction = data.transaction || {};
        const merchant = data.merchant || {};
        const customer = data.customer || {};

        id = transaction.transactionId;
        subAccountId = merchant.userId || merchant.walletId;
        amount = Number(transaction.transactionAmount);
        senderName = customer.senderName;
        narration = transaction.narration;
        transactionDate = new Date(transaction.time);
    } else {
        // Legacy / Flat structure (Sandbox / previous implementation)
        id = data.reference;
        subAccountId = data.merchantId;
        amount = Number(data.amount);
        senderName = data.senderName;
        narration = data.narration;
        transactionDate = new Date(data.transactionDate);
    }

    return prisma.transaction.create({
        data: {
            id,
            merchant: {
                connect: {
                    subAccountId,
                },
            },
            amount,
            senderName,
            narration,
            eventType: payload.event_type,
            transactionDate,
        },
    });
};