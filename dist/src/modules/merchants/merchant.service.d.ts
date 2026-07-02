interface CreateMerchantInput {
    businessName: string;
    phone: string;
    subAccountId: string;
}
export declare const createMerchant: (data: CreateMerchantInput) => Promise<{
    id: string;
    businessName: string;
    phone: string;
    pinHash: string | null;
    subAccountId: string;
    virtualAccountRef: string | null;
    accountNumber: string | null;
    accountName: string | null;
    bankName: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export {};
//# sourceMappingURL=merchant.service.d.ts.map