import { prisma } from "../../lib/prisma.js";
import { getSummaryAnalytics } from "../analytics/analytics.service.js";
import { getBusinessHealthScore } from "../analytics/calculators/health.js";

const createInsight = async (
  merchantId: string,
  type: string,
  title: string,
  message: string,
) => {
  await prisma.insight.deleteMany({
    where: {
      merchantId,
      type,
    },
  });

  return prisma.insight.create({
    data: {
      merchantId,
      type,
      title,
      message,
    },
  });
};

export const generateInsights = async (merchantId: string) => {
  const summary = await getSummaryAnalytics(merchantId);
  const growth = summary.growth;
  const insights = [];

  if (summary.weeklyRevenue === 0) {
    insights.push(
      await createInsight(
        merchantId,
        "no_revenue",
        "No revenue this week",
        "There were no transactions recorded for this merchant in the last 7 days.",
      ),
    );
  } else if (growth > 20) {
    insights.push(
      await createInsight(
        merchantId,
        "growth",
        "Revenue increased strongly",
        `Revenue increased by ${growth.toFixed(2)}% this week. Keep pushing this momentum!`,
      ),
    );
  } else if (growth > 10) {
    insights.push(
      await createInsight(
        merchantId,
        "growth",
        "Revenue is growing",
        `Revenue grew by ${growth.toFixed(2)}% week over week. This is a healthy growth trend.`,
      ),
    );
  } else if (growth > 0) {
    insights.push(
      await createInsight(
        merchantId,
        "growth",
        "Revenue is positive",
        `Revenue rose by ${growth.toFixed(2)}% compared to last week. The business is moving in the right direction.`,
      ),
    );
  } else {
    insights.push(
      await createInsight(
        merchantId,
        "decline",
        "Revenue declined",
        `Revenue fell by ${Math.abs(growth).toFixed(2)}% compared to last week. Review recent transactions and promotions.`,
      ),
    );
  }

  insights.push(
    await createInsight(
      merchantId,
      "health",
      "Business health score",
      `The business health score is ${getBusinessHealthScore(growth)} based on ${growth.toFixed(2)}% weekly growth.`,
    ),
  );

  return {
    summary,
    insights,
  };
};

export const getInsights = async (merchantId: string) => {
  const insights = await prisma.insight.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
  });

  return insights.map((insight) => ({
    type: insight.type,
    message: insight.message,
  }));
};
