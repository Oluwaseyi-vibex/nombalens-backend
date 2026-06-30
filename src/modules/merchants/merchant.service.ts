import { prisma } from "../../lib/prisma.js";

interface CreateMerchantInput {
    businessName: string;
    phone: string;
    subAccountId: string;
}

export const createMerchant = async (data: CreateMerchantInput) => {
    return prisma.merchant.create({
        data,
    });
};