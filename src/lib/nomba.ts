let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiresAt: number = 0; // Unix timestamp in ms

export const getNombaAccessToken = async (): Promise<string> => {
    const now = Date.now();
    // Refresh 5 minutes (300,000 ms) before expiry as recommended
    if (cachedAccessToken && (tokenExpiresAt - 300000 > now)) {
        return cachedAccessToken;
    }

    const accountId = process.env.NOMBA_ACCOUNT_ID;
    const baseUrl = process.env.NOMBA_BASE_URL || "https://api.nomba.com";

    if (!accountId) {
        throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
    }

    // 1. Try Refresh Token first
    if (cachedRefreshToken && cachedAccessToken) {
        try {
            const response = await fetch(`${baseUrl}/v1/auth/token/refresh`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cachedAccessToken}`,
                    "Content-Type": "application/json",
                    "accountId": accountId
                },
                body: JSON.stringify({
                    grant_type: "refresh_token",
                    refresh_token: cachedRefreshToken
                })
            });

            const resData = await response.json() as any;
            if (resData.code === "00") {
                cachedAccessToken = resData.data.access_token;
                cachedRefreshToken = resData.data.refresh_token;
                tokenExpiresAt = new Date(resData.data.expiresAt).getTime();
                return cachedAccessToken as string;
            }
            // If refresh fails (e.g. token expired beyond refresh limit), fall through to issue a new one
        } catch (error) {
            console.error("Nomba Token Refresh failed, attempting to issue a new token...", error);
        }
    }

    // 2. Obtain New Token
    const clientId = process.env.NOMBA_CLIENT_ID;
    const clientSecret = process.env.NOMBA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("NOMBA_CLIENT_ID or NOMBA_CLIENT_SECRET is missing from environment variables");
    }

    const response = await fetch(`${baseUrl}/v1/auth/token/issue`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accountId": accountId
        },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret
        })
    });

    const resData = await response.json() as any;

    if (resData.code !== "00") {
        throw new Error(`Nomba Authentication failed: ${resData.description || 'Unknown Error'}`);
    }

    cachedAccessToken = resData.data.access_token;
    cachedRefreshToken = resData.data.refresh_token;
    tokenExpiresAt = new Date(resData.data.expiresAt).getTime();

    if (!cachedAccessToken) {
        throw new Error("Nomba API did not return an access token.");
    }

    return cachedAccessToken;
};
