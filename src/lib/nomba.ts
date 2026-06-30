import { createLogger } from "./logger.js";

const log = createLogger("NombaAuth");

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiresAt: number = 0;

export const getNombaAccessToken = async (): Promise<string> => {
    const now = Date.now();

    // Refresh 5 minutes before expiry as recommended in Nomba docs
    if (cachedAccessToken && (tokenExpiresAt - 300000 > now)) {
        log.debug("Using cached Nomba access token", {
            expiresIn: `${Math.round((tokenExpiresAt - now) / 1000)}s`,
        });
        return cachedAccessToken;
    }

    const accountId = process.env.NOMBA_ACCOUNT_ID;
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";

    if (!accountId) {
        throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
    }

    // 1. Try Refresh Token first
    if (cachedRefreshToken && cachedAccessToken) {
        log.info("Access token expired or near expiry — attempting refresh");
        try {
            const response = await fetch(`${baseUrl}/v1/auth/token/refresh`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cachedAccessToken}`,
                    "Content-Type": "application/json",
                    "accountId": accountId,
                },
                body: JSON.stringify({
                    grant_type: "refresh_token",
                    refresh_token: cachedRefreshToken,
                }),
            });

            const resData = await response.json() as any;
            if (resData.code === "00") {
                cachedAccessToken = resData.data.access_token;
                cachedRefreshToken = resData.data.refresh_token;
                tokenExpiresAt = new Date(resData.data.expiresAt).getTime();
                log.info("Nomba token refreshed successfully", { expiresAt: resData.data.expiresAt });
                return cachedAccessToken as string;
            }

            log.warn("Token refresh returned a non-success code — falling back to full re-issue", {
                code: resData.code,
                description: resData.description,
            });
        } catch (error) {
            log.error("Token refresh request failed — falling back to full re-issue", error);
        }
    }

    // 2. Issue a brand new token
    const clientId = process.env.NOMBA_CLIENT_ID;
    const clientSecret = process.env.NOMBA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("NOMBA_CLIENT_ID or NOMBA_CLIENT_SECRET is missing from environment variables");
    }

    log.info("Issuing new Nomba access token", { baseUrl, accountId });

    const response = await fetch(`${baseUrl}/v1/auth/token/issue`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accountId": accountId,
        },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });

    const resData = await response.json() as any;

    if (resData.code !== "00") {
        log.error("Nomba token issue failed", undefined, {
            code: resData.code,
            description: resData.description,
        });
        throw new Error(`Nomba Authentication failed: ${resData.description || "Unknown Error"}`);
    }

    cachedAccessToken = resData.data.access_token;
    cachedRefreshToken = resData.data.refresh_token;
    tokenExpiresAt = new Date(resData.data.expiresAt).getTime();

    log.info("Nomba access token issued successfully", { expiresAt: resData.data.expiresAt });

    if (!cachedAccessToken) {
        throw new Error("Nomba API did not return an access token.");
    }

    return cachedAccessToken;
};
