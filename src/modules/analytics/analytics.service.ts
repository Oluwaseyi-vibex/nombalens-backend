import { prisma } from "../../lib/prisma.js";

const toCurrency = (value: unknown) => Number(value?.toString() ?? 0);

export const getWeeklyRevenue = async (merchantId: string) => {
  const now = new Date();

  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - 7);
  currentWeekStart.setHours(0, 0, 0, 0);

  const previousWeekStart = new Date(now);
  previousWeekStart.setDate(now.getDate() - 14);
  previousWeekStart.setHours(0, 0, 0, 0);

  const [currentWeekRevenue, previousWeekRevenue] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        merchantId,
        transactionDate: {
          gte: currentWeekStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        merchantId,
        transactionDate: {
          gte: previousWeekStart,
          lt: currentWeekStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const currentRevenue = toCurrency(currentWeekRevenue._sum.amount);
  const previousRevenue = toCurrency(previousWeekRevenue._sum.amount);

  const growth =
    previousRevenue === 0
      ? currentRevenue > 0
        ? 100
        : 0
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

  return {
    weeklyRevenue: currentRevenue,
    growth: Number(growth.toFixed(2)),
  };
};

export const getSummaryAnalytics = async (merchantId: string) => {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - 7);
  currentWeekStart.setHours(0, 0, 0, 0);

  const previousWeekStart = new Date(now);
  previousWeekStart.setDate(now.getDate() - 14);
  previousWeekStart.setHours(0, 0, 0, 0);

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todayRevenueResult,
    weeklyRevenueResult,
    monthlyRevenueResult,
    previousWeekRevenueResult,
    totalTransactions,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        merchantId,
        transactionDate: {
          gte: todayStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        merchantId,
        transactionDate: {
          gte: currentWeekStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        merchantId,
        transactionDate: {
          gte: currentMonthStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        merchantId,
        transactionDate: {
          gte: previousWeekStart,
          lt: currentWeekStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.count({
      where: { merchantId },
    }),
  ]);

  const todayRevenue = toCurrency(todayRevenueResult._sum.amount);
  const weeklyRevenue = toCurrency(weeklyRevenueResult._sum.amount);
  const monthlyRevenue = toCurrency(monthlyRevenueResult._sum.amount);
  const previousWeekRevenue = toCurrency(previousWeekRevenueResult._sum.amount);

  const growth =
    previousWeekRevenue === 0
      ? weeklyRevenue > 0
        ? 100
        : 0
      : ((weeklyRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;

  const getHealthScore = (value: number) => {
    if (value > 20) return "Excellent";
    if (value > 10) return "Good";
    if (value > 0) return "Average";
    return "Poor";
  };

  return {
    todayRevenue,
    weeklyRevenue,
    monthlyRevenue,
    growth: Number(growth.toFixed(2)),
    totalTransactions,
    businessHealth: {
      score: getHealthScore(growth),
      growth: Number(growth.toFixed(2)),
      weeklyRevenue,
    },
  };
};
