import { prisma } from "../../lib/prisma.js";

export const getWeeklyRevenue = async (merchantId: string) => {
    const now = new Date();

    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - 7);

    const previousWeekStart = new Date(now);
    previousWeekStart.setDate(now.getDate() - 14);

    const currentWeekTransactions = await prisma.transaction.findMany({
        where: {
            merchantId,
            transactionDate: {
                gte: currentWeekStart,
            },
        },
    });

    const previousWeekTransactions = await prisma.transaction.findMany({
        where: {
            merchantId,
            transactionDate: {
                gte: previousWeekStart,
                lt: currentWeekStart,
            },
        },
    });

    const currentRevenue = currentWeekTransactions.reduce(
        (sum, tx) => sum + tx.amount,
        0
    );

    const previousRevenue = previousWeekTransactions.reduce(
        (sum, tx) => sum + tx.amount,
        0
    );

    const growth =
        previousRevenue === 0
            ? 100
            : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return {
        weeklyRevenue: currentRevenue,
        growth: Number(growth.toFixed(2)),
    };
};