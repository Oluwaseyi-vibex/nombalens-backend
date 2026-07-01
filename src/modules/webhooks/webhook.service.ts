import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { createLogger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";

const log = createLogger("WebhookService");

export const handlePaymentSuccess = async (payload: any) => {
  const data = payload.data || {};
  const isNested = data.transaction !== undefined;

  log.debug("Processing payment_success webhook", {
    isNested,
    requestId: payload.requestId,
  });

  let id: string | undefined;
  let merchantInternalId: string | undefined;
  let subAccountId: string | undefined;
  let bankAccountNumber: string | undefined;
  let amount: number;
  let senderName: string | undefined;
  let narration: string | undefined;
  let transactionDate: Date;

  if (isNested) {
    const transaction = data.transaction || {};
    const merchant = data.merchant || {};
    const customer = data.customer || {};

    id = transaction.transactionId;
    merchantInternalId =
      transaction.aliasAccountReference || transaction.accountRef;
    subAccountId = merchant.userId || merchant.walletId;
    bankAccountNumber =
      transaction.aliasAccountNumber || transaction.accountNumber;
    amount = Number(transaction.transactionAmount);
    senderName = customer.senderName;
    narration = transaction.narration;
    transactionDate = new Date(transaction.time);

    log.debug("Parsed V2 payload", {
      id,
      merchantInternalId,
      subAccountId,
      bankAccountNumber,
      amount,
    });
  } else {
    id = data.reference;
    merchantInternalId = data.accountRef;
    subAccountId = data.merchantId;
    bankAccountNumber = data.accountNumber;
    amount = Number(data.amount);
    senderName = data.senderName;
    narration = data.narration;
    transactionDate = new Date(data.transactionDate);

    log.debug("Parsed legacy flat payload", {
      id,
      merchantInternalId,
      subAccountId,
      bankAccountNumber,
      amount,
    });
  }

  // 1. Resolve merchant by accountRef (best case — what we passed to Nomba)
  let merchantRecord = null;
  if (merchantInternalId) {
    log.debug("Looking up merchant by internal ID (accountRef)", {
      merchantInternalId,
    });
    merchantRecord = await prisma.merchant.findUnique({
      where: { id: merchantInternalId },
    });
    if (merchantRecord)
      log.info("Merchant resolved via accountRef", {
        merchantId: merchantRecord.id,
      });
  }

  // 2. Resolve by bank account number
  if (!merchantRecord && bankAccountNumber) {
    log.debug("Falling back to lookup by bank account number", {
      bankAccountNumber,
    });
    merchantRecord = await prisma.merchant.findFirst({
      where: { accountNumber: bankAccountNumber },
    });
    if (merchantRecord)
      log.info("Merchant resolved via accountNumber", {
        merchantId: merchantRecord.id,
      });
  }

  // 3. Fallback by subAccountId
  if (!merchantRecord && subAccountId) {
    log.debug("Falling back to lookup by subAccountId", { subAccountId });
    merchantRecord = await prisma.merchant.findUnique({
      where: { subAccountId },
    });
    if (merchantRecord)
      log.info("Merchant resolved via subAccountId", {
        merchantId: merchantRecord.id,
      });
  }

  if (!merchantRecord) {
    log.error("Merchant not found — cannot process transaction", undefined, {
      transactionId: id,
      merchantInternalId,
      bankAccountNumber,
      subAccountId,
    });
    throw new Error(`Merchant not found for webhook transaction ${id}`);
  }

  log.info("Saving transaction to database", {
    transactionId: id,
    merchantId: merchantRecord.id,
    amount,
    senderName,
  });

  const transaction = await prisma.transaction.upsert({
    where: { nombaTransactionId: id! },
    update: {
      merchant: { connect: { id: merchantRecord.id } },
      amount: new Prisma.Decimal(amount.toFixed(2)),
      senderName: senderName ?? null,
      narration: narration ?? null,
      eventType: payload.event_type,
      transactionDate: transactionDate!,
    },
    create: {
      id: randomUUID(),
      nombaTransactionId: id!,
      merchant: { connect: { id: merchantRecord.id } },
      amount: new Prisma.Decimal(amount.toFixed(2)),
      senderName: senderName ?? null,
      narration: narration ?? null,
      eventType: payload.event_type,
      transactionDate: transactionDate!,
    },
  });

  log.info("Transaction saved successfully", { transactionId: transaction.id });
  return transaction;
};
