import { prisma } from "../../lib/prisma.js";

export const handlePaymentSuccess = async (payload: any) => {
    const data = payload.data || {};
    const transaction = data.transaction || {};
    const merchant = data.merchant || {};
    const customer = data.customer || {};

    // We assume the Nomba merchant.userId maps to our internal subAccountId
    const subAccountId = merchant.userId; 

    return prisma.transaction.create({
        data: {
            id: transaction.transactionId,
            merchant: {
                connect: {
                    subAccountId: subAccountId,
                },
            },
            amount: Number(transaction.transactionAmount),
            senderName: customer.senderName,
            narration: transaction.narration,
            eventType: payload.event_type,
            transactionDate: new Date(transaction.time),
        },
    });
};