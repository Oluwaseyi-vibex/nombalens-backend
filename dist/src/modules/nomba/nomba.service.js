import { getNombaAccessToken } from "../../lib/nomba.js";
import { createLogger } from "../../lib/logger.js";
const log = createLogger("NombaService");
const getNombaHeaders = (token, accountId) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    accountId: accountId,
});
export const fetchParentAccountDetails = async () => {
    const token = await getNombaAccessToken();
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    const accountId = process.env.NOMBA_ACCOUNT_ID;
    if (!accountId) {
        throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
    }
    log.info("Fetching Nomba parent account details", { baseUrl, accountId });
    const response = await fetch(`${baseUrl}/v1/accounts/parent`, {
        method: "GET",
        headers: getNombaHeaders(token, accountId),
    });
    const resData = (await response.json());
    if (resData.code !== "00") {
        log.error("Failed to fetch Nomba parent account details", undefined, {
            code: resData.code,
            description: resData.description,
        });
        throw new Error(`Nomba parent account fetch failed: ${resData.description || resData.code}`);
    }
    return resData;
};
export const fetchSubAccountDetails = async (options) => {
    const token = await getNombaAccessToken();
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    const parentAccountId = process.env.NOMBA_ACCOUNT_ID;
    if (!parentAccountId) {
        throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
    }
    if (!options.subAccountId && !options.accountRef) {
        throw new Error("Either query parameter accountId or accountRef must be provided.");
    }
    const query = new URLSearchParams();
    if (options.subAccountId)
        query.set("accountId", options.subAccountId);
    if (options.accountRef)
        query.set("accountRef", options.accountRef);
    const requestUrl = `${baseUrl}/v1/accounts/sub-account-details?${query.toString()}`;
    log.info("Fetching Nomba sub-account details", {
        baseUrl,
        parentAccountId,
        subAccountId: options.subAccountId,
        accountRef: options.accountRef,
    });
    const response = await fetch(requestUrl, {
        method: "GET",
        headers: getNombaHeaders(token, parentAccountId),
    });
    const resData = (await response.json());
    if (resData.code !== "00") {
        log.error("Failed to fetch Nomba sub-account details", undefined, {
            code: resData.code,
            description: resData.description,
        });
        throw new Error(`Nomba sub-account fetch failed: ${resData.description || resData.code}`);
    }
    return resData;
};
export const fetchSubAccountBalance = async (subAccountId) => {
    const token = await getNombaAccessToken();
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    const parentAccountId = process.env.NOMBA_ACCOUNT_ID;
    if (!parentAccountId) {
        throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
    }
    if (!subAccountId) {
        throw new Error("subAccountId is required");
    }
    log.info("Fetching Nomba sub-account balance", {
        baseUrl,
        parentAccountId,
        subAccountId,
    });
    const response = await fetch(`${baseUrl}/v1/accounts/${subAccountId}/balance`, {
        method: "GET",
        headers: getNombaHeaders(token, parentAccountId),
    });
    const resData = (await response.json());
    if (resData.code !== "00") {
        log.error("Failed to fetch Nomba sub-account balance", undefined, {
            code: resData.code,
            description: resData.description,
        });
        throw new Error(`Nomba sub-account balance fetch failed: ${resData.description || resData.code}`);
    }
    return resData;
};
//# sourceMappingURL=nomba.service.js.map