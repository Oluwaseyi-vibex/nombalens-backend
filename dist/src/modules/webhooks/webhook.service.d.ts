import { Prisma } from "@prisma/client";
export declare const handlePaymentSuccess: (payload: any) => Promise<{
    id: string;
    createdAt: Date;
    merchantId: string;
    nombaTransactionId: string;
    customerId: string | null;
    amount: Prisma.Decimal;
    senderName: string | null;
    narration: string | null;
    eventType: string;
    transactionDate: Date;
}>;
//# sourceMappingURL=webhook.service.d.ts.map