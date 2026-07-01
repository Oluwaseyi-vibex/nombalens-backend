import { fetchParentAccountBalance, fetchParentAccountDetails, fetchSubAccountBalance, fetchSubAccountDetails, } from "./nomba.service.js";
export const getParentAccountHandler = async (req, res) => {
    try {
        const parentAccount = await fetchParentAccountDetails();
        res.status(200).json({ success: true, data: parentAccount });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Unknown error fetching Nomba parent account";
        res.status(500).json({ success: false, error: message });
    }
};
export const getSubAccountDetailsHandler = async (req, res) => {
    try {
        const subAccountId = typeof req.query.accountId === "string" ? req.query.accountId : undefined;
        const accountRef = typeof req.query.accountRef === "string"
            ? req.query.accountRef
            : undefined;
        const queryOptions = {};
        if (subAccountId)
            queryOptions.subAccountId = subAccountId;
        if (accountRef)
            queryOptions.accountRef = accountRef;
        const subAccountDetails = await fetchSubAccountDetails(queryOptions);
        res.status(200).json({ success: true, data: subAccountDetails });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Unknown error fetching Nomba sub account details";
        const status = message.includes("missing") || message.includes("must be provided")
            ? 400
            : 500;
        res.status(status).json({ success: false, error: message });
    }
};
export const getParentAccountBalanceHandler = async (req, res) => {
    try {
        const balance = await fetchParentAccountBalance();
        res.status(200).json({ success: true, data: balance });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Unknown error fetching Nomba parent account balance";
        res.status(500).json({ success: false, error: message });
    }
};
export const getSubAccountBalanceHandler = async (req, res) => {
    try {
        const subAccountId = typeof req.params.subAccountId === "string"
            ? req.params.subAccountId
            : undefined;
        if (!subAccountId) {
            res
                .status(400)
                .json({ success: false, error: "subAccountId is required" });
            return;
        }
        const balance = await fetchSubAccountBalance(subAccountId);
        res.status(200).json({ success: true, data: balance });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Unknown error fetching Nomba sub account balance";
        const status = message.includes("required") ? 400 : 500;
        res.status(status).json({ success: false, error: message });
    }
};
//# sourceMappingURL=nomba.controller.js.map