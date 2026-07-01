/*
  Warnings:

  - You are about to alter the column `totalPaid` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - A unique constraint covering the columns `[nombaTransactionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombaTransactionId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "totalPaid" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Merchant" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "nombaTransactionId" TEXT;
UPDATE "Transaction" SET "nombaTransactionId" = "id" WHERE "nombaTransactionId" IS NULL;
ALTER TABLE "Transaction" ALTER COLUMN "nombaTransactionId" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);
ALTER TABLE "Transaction" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateIndex
CREATE INDEX "Customer_merchantId_idx" ON "Customer"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_nombaTransactionId_key" ON "Transaction"("nombaTransactionId");

-- CreateIndex
CREATE INDEX "Transaction_merchantId_idx" ON "Transaction"("merchantId");
