import type { Request, Response } from "express";
import {
  fetchParentAccountDetails,
  fetchSubAccountBalance,
  fetchSubAccountDetails,
} from "./nomba.service.js";

export const getParentAccountHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parentAccount = await fetchParentAccountDetails();
    res.status(200).json({ success: true, data: parentAccount });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error fetching Nomba parent account";
    res.status(500).json({ success: false, error: message });
  }
};

export const getSubAccountDetailsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const subAccountId =
      typeof req.query.accountId === "string" ? req.query.accountId : undefined;
    const accountRef =
      typeof req.query.accountRef === "string"
        ? req.query.accountRef
        : undefined;

    const queryOptions: { subAccountId?: string; accountRef?: string } = {};
    if (subAccountId) queryOptions.subAccountId = subAccountId;
    if (accountRef) queryOptions.accountRef = accountRef;

    const subAccountDetails = await fetchSubAccountDetails(queryOptions);

    res.status(200).json({ success: true, data: subAccountDetails });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error fetching Nomba sub account details";
    const status =
      message.includes("missing") || message.includes("must be provided")
        ? 400
        : 500;
    res.status(status).json({ success: false, error: message });
  }
};

export const getSubAccountBalanceHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const subAccountId =
      typeof req.params.subAccountId === "string"
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
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error fetching Nomba sub account balance";
    const status = message.includes("required") ? 400 : 500;
    res.status(status).json({ success: false, error: message });
  }
};
