import { prisma } from "../../lib/prisma.js";

export const handlePaymentSuccess = async (payload: any) => {
    const data = payload.data || {};
    const isNested = data.transaction !== undefined;

    let id, merchantInternalId, subAccountId, bankAccountNumber, amount, senderName, narration, transactionDate;

    if (isNested) {
        // Nomba V2 / Nested structure
        const transaction = data.transaction || {};
        const merchant = data.merchant || {};
        const customer = data.customer || {};

        id = transaction.transactionId;
        // The Best Case Scenario: Nomba echoes our internal merchant UUID back!
        merchantInternalId = transaction.aliasAccountReference || transaction.accountRef; 
        subAccountId = merchant.userId || merchant.walletId;
        bankAccountNumber = transaction.aliasAccountNumber || transaction.accountNumber;
        
        amount = Number(transaction.transactionAmount);
        senderName = customer.senderName;
        narration = transaction.narration;
        transactionDate = new Date(transaction.time);
    } else {
        // Legacy / Flat structure
        id = data.reference;
        merchantInternalId = data.accountRef;
        subAccountId = data.merchantId;
        bankAccountNumber = data.accountNumber;
        
        amount = Number(data.amount);
        senderName = data.senderName;
        narration = data.narration;
        transactionDate = new Date(data.transactionDate);
    }

    // 1. Resolve merchant by exactly what we passed to Nomba (Best Case Scenario)
    let merchantRecord = null;

    if (merchantInternalId) {
        merchantRecord = await prisma.merchant.findUnique({
            where: { id: merchantInternalId }
        });
    }

    // 2. Second Best Scenario: Resolve by Bank Account Number
    if (!merchantRecord && bankAccountNumber) {
        merchantRecord = await prisma.merchant.findFirst({
            where: { accountNumber: bankAccountNumber }
        });
    }

    // 3. Fallback to Sub Account ID
    if (!merchantRecord && subAccountId) {
        merchantRecord = await prisma.merchant.findUnique({
            where: { subAccountId }
        });
    }

    if (!merchantRecord) {
        throw new Error(`Merchant not found for webhook transaction ${id}`);
    }

    return prisma.transaction.create({
        data: {
            id,
            merchant: {
                connect: {
                    id: merchantRecord.id,
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