export declare const getWeeklyRevenue: (merchantId: string) => Promise<{
    weeklyRevenue: number;
    growth: number;
}>;
export declare const getSummaryAnalytics: (merchantId: string) => Promise<{
    todayRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    growth: number;
    totalTransactions: number;
    businessHealth: {
        score: string;
        growth: number;
        weeklyRevenue: number;
    };
}>;
//# sourceMappingURL=analytics.service.d.ts.map