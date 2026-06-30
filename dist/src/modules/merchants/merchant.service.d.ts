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
    virtualAccountRef: string | null;
    accountNumber: string | null;
    accountName: string | null;
    bankName: string | null;
    createdAt: Date;
}>;
export {};
//# sourceMappingURL=merchant.service.d.ts.map