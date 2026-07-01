export interface PaymentLinkInput {
    merchantId: string;
    amount: number;
    currency?: string;
    description?: string;
    redirectUrl?: string;
    customerName?: string;
    customerEmail?: string;
}
export declare const createPaymentLink: (payload: PaymentLinkInput) => Promise<unknown>;
//# sourceMappingURL=payments.service.d.ts.map