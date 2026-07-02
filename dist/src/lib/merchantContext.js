export const getMerchantIdFromRequest = (req) => {
    return req.user?.merchantId ?? req.params.merchantId;
};
//# sourceMappingURL=merchantContext.js.map