export declare const generateInsights: (merchantId: string) => Promise<{
    summary: {
        todayRevenue: number;
        weeklyRevenue: number;
        monthlyRevenue: number;
        growth: number;
        totalTransactions: number;
    };
    insights: {
        id: string;
        createdAt: Date;
        merchantId: string;
        type: string;
        title: string;
        message: string;
    }[];
}>;
export declare const getInsights: (merchantId: string) => Promise<{
    type: string;
    message: string;
}[]>;
//# sourceMappingURL=insights.service.d.ts.map