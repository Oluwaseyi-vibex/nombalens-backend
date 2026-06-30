interface CreateMerchantInput {
    businessName: string;
    phone: string;
    subAccountId: string;
}
export declare const createMerchant: (data: CreateMerchantInput) => Promise<{
    id: string;
    businessName: string;
    phone: string;
    subAccountId: string;
    createdAt: Date;
}>;
export {};
//# sourceMappingURL=merchant.service.d.ts.map