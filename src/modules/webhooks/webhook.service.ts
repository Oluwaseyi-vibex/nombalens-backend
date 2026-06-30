import { prisma } from "../../lib/prisma.js";

export const handlePaymentSuccess = async (payload: any) => {
    const data = payload.data;

    return prisma.transaction.create({
        data: {
            id: data.reference,
            merchant: {
                connect: {
                    subAccountId: data.merchantId,
                },
            },
            amount: Number(data.amount),
            senderName: data.senderName,
            narration: data.narration,
            eventType: payload.event_type,
            transactionDate: new Date(data.transactionDate),
        },
    });
};