export interface NombaAccountDetailsResponse {
    code: string;
    description: string;
    data: {
        createdAt: string;
        accountId: string;
        accountHolderId: string;
        accountRef: string;
        bvn: string;
        status: string;
        type: string;
        accountName: string;
        currency: string;
        banks: Array<{
            bankAccountNumber: string;
            bankName: string;
            bankAccountName: string;
        }>;
    };
}
export interface NombaAccountBalanceResponse {
    code: string;
    description: string;
    data: {
        amount: string;
        currency: string;
        timeCreated: string;
    };
}
export declare const fetchParentAccountDetails: () => Promise<NombaAccountDetailsResponse>;
export declare const fetchSubAccountDetails: (options: {
    subAccountId?: string;
    accountRef?: string;
}) => Promise<NombaAccountDetailsResponse>;
export declare const fetchSubAccountBalance: (subAccountId: string) => Promise<NombaAccountBalanceResponse>;
//# sourceMappingURL=nomba.service.d.ts.map