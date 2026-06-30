import { prisma } from "../../lib/prisma.js";
export const createMerchant = async (data) => {
    return prisma.merchant.create({
        data,
    });
};
//# sourceMappingURL=merchant.service.js.map