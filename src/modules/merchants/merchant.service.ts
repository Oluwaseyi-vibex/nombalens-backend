import { prisma } from "../../lib/prisma.js";
import { getNombaAccessToken } from "../../lib/nomba.js";

interface CreateMerchantInput {
    businessName: string;
    phone: string;
    subAccountId: string;
}

export const createMerchant = async (data: CreateMerchantInput) => {
    // 1. Save Merchant
    const merchant = await prisma.merchant.create({
        data,
    });

    try {
        // 2. Call Nomba Virtual Account API
        const NOMBA_BASE_URL = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
        const NOMBA_ACCOUNT_ID = process.env.NOMBA_ACCOUNT_ID;

        // Use the secure token acquisition logic
        const NOMBA_TOKEN = await getNombaAccessToken();

        if (!NOMBA_ACCOUNT_ID) {
            console.warn("NOMBA_ACCOUNT_ID is not configured in .env. Skipping Virtual Account creation.");
            return merchant;
        }

        const response = await fetch(`${NOMBA_BASE_URL}/v1/accounts/virtual/${merchant.subAccountId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${NOMBA_TOKEN}`,
                "accountId": NOMBA_ACCOUNT_ID
            },
            body: JSON.stringify({
                accountRef: merchant.id,
                accountName: merchant.businessName
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Failed to create virtual account: ${errBody}`);
        }

        const resData = await response.json();
        const virtualAccount = resData.data;

        // 3. Save Virtual Account
        return await prisma.merchant.update({
            where: { id: merchant.id },
            data: {
                virtualAccountRef: virtualAccount.accountRef,
                accountNumber: virtualAccount.bankAccountNumber,
                accountName: virtualAccount.bankAccountName,
                bankName: virtualAccount.bankName,
            }
        });
    } catch (error) {
        console.error("Error creating Virtual Account for merchant:", error);
        return merchant;
    }
};