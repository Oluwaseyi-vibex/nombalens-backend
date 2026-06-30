import { createLogger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { getNombaAccessToken } from "../../lib/nomba.js";

const log = createLogger("MerchantService");

interface CreateMerchantInput {
    businessName: string;
    phone: string;
    subAccountId: string;
}

export const createMerchant = async (data: CreateMerchantInput) => {
    log.info("Creating merchant", { businessName: data.businessName, subAccountId: data.subAccountId });

    // 1. Save Merchant
    const merchant = await prisma.merchant.create({ data });
    log.info("Merchant saved to database", { merchantId: merchant.id });

    try {
        // 2. Call Nomba Virtual Account API
        const NOMBA_BASE_URL = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
        const NOMBA_ACCOUNT_ID = process.env.NOMBA_ACCOUNT_ID;

        if (!NOMBA_ACCOUNT_ID) {
            log.warn("NOMBA_ACCOUNT_ID is not configured. Skipping Virtual Account creation.", { merchantId: merchant.id });
            return merchant;
        }

        log.info("Fetching Nomba access token for virtual account creation...");
        const NOMBA_TOKEN = await getNombaAccessToken();
        log.debug("Nomba access token acquired");

        log.info("Requesting virtual account from Nomba", {
            merchantId: merchant.id,
            subAccountId: merchant.subAccountId,
            accountRef: merchant.id,
        });

        const response = await fetch(`${NOMBA_BASE_URL}/v1/accounts/virtual/${merchant.subAccountId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${NOMBA_TOKEN}`,
                "accountId": NOMBA_ACCOUNT_ID,
            },
            body: JSON.stringify({
                accountRef: merchant.id,
                accountName: merchant.businessName,
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            log.error("Nomba Virtual Account creation HTTP error", undefined, {
                merchantId: merchant.id,
                status: response.status,
                body: errBody,
            });
            throw new Error(`Failed to create virtual account: ${errBody}`);
        }

        const resData = await response.json() as any;
        const virtualAccount = resData.data;

        log.info("Virtual account created successfully", {
            merchantId: merchant.id,
            accountNumber: virtualAccount.bankAccountNumber,
            bankName: virtualAccount.bankName,
        });

        // 3. Save Virtual Account details
        const updated = await prisma.merchant.update({
            where: { id: merchant.id },
            data: {
                virtualAccountRef: virtualAccount.accountRef,
                accountNumber: virtualAccount.bankAccountNumber,
                accountName: virtualAccount.bankAccountName,
                bankName: virtualAccount.bankName,
            },
        });

        log.info("Merchant updated with virtual account details", { merchantId: merchant.id });
        return updated;

    } catch (error) {
        log.error("Error during virtual account creation — returning merchant without virtual account", error, {
            merchantId: merchant.id,
        });
        return merchant;
    }
};