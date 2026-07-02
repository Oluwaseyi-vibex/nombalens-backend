import type { Request } from "express";

export const getMerchantIdFromRequest = (req: Request): string | undefined => {
  return req.user?.merchantId ?? (req.params.merchantId as string | undefined);
};
