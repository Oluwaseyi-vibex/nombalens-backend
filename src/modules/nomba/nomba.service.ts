import { getNombaAccessToken } from "../../lib/nomba.js";
import { createLogger } from "../../lib/logger.js";

const log = createLogger("NombaService");

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

const getNombaHeaders = (token: string, accountId: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  accountId: accountId,
});

export const fetchParentAccountDetails =
  async (): Promise<NombaAccountDetailsResponse> => {
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

    const resData = (await response.json()) as NombaAccountDetailsResponse;

    if (resData.code !== "00") {
      log.error("Failed to fetch Nomba parent account details", undefined, {
        code: resData.code,
        description: resData.description,
      });
      throw new Error(
        `Nomba parent account fetch failed: ${resData.description || resData.code}`,
      );
    }

    return resData;
  };

export const fetchSubAccountDetails = async (options: {
  subAccountId?: string;
  accountRef?: string;
}): Promise<NombaAccountDetailsResponse> => {
  const token = await getNombaAccessToken();
  const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
  const parentAccountId = process.env.NOMBA_ACCOUNT_ID;

  if (!parentAccountId) {
    throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
  }

  if (!options.subAccountId && !options.accountRef) {
    throw new Error(
      "Either query parameter accountId or accountRef must be provided.",
    );
  }

  const query = new URLSearchParams();
  if (options.subAccountId) query.set("accountId", options.subAccountId);
  if (options.accountRef) query.set("accountRef", options.accountRef);

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

  const resData = (await response.json()) as NombaAccountDetailsResponse;

  if (resData.code !== "00") {
    log.error("Failed to fetch Nomba sub-account details", undefined, {
      code: resData.code,
      description: resData.description,
    });
    throw new Error(
      `Nomba sub-account fetch failed: ${resData.description || resData.code}`,
    );
  }

  return resData;
};

export const fetchParentAccountBalance =
  async (): Promise<NombaAccountBalanceResponse> => {
    const token = await getNombaAccessToken();
    const baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    const parentAccountId = process.env.NOMBA_ACCOUNT_ID;

    if (!parentAccountId) {
      throw new Error("NOMBA_ACCOUNT_ID is missing from environment variables");
    }

    log.info("Fetching Nomba parent account balance", {
      baseUrl,
      parentAccountId,
    });

    const response = await fetch(`${baseUrl}/v1/accounts/balance`, {
      method: "GET",
      headers: getNombaHeaders(token, parentAccountId),
    });

    const resData = (await response.json()) as NombaAccountBalanceResponse;

    if (resData.code !== "00") {
      log.error("Failed to fetch Nomba parent account balance", undefined, {
        code: resData.code,
        description: resData.description,
      });
      throw new Error(
        `Nomba parent account balance fetch failed: ${resData.description || resData.code}`,
      );
    }

    return resData;
  };

export const fetchSubAccountBalance = async (
  subAccountId: string,
): Promise<NombaAccountBalanceResponse> => {
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

  const response = await fetch(
    `${baseUrl}/v1/accounts/${subAccountId}/balance`,
    {
      method: "GET",
      headers: getNombaHeaders(token, parentAccountId),
    },
  );

  const resData = (await response.json()) as NombaAccountBalanceResponse;

  if (resData.code !== "00") {
    log.error("Failed to fetch Nomba sub-account balance", undefined, {
      code: resData.code,
      description: resData.description,
    });
    throw new Error(
      `Nomba sub-account balance fetch failed: ${resData.description || resData.code}`,
    );
  }

  return resData;
};
