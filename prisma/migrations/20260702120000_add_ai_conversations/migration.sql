-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiConversation_merchantId_idx" ON "AiConversation"("merchantId");

-- CreateIndex
CREATE INDEX "AiConversation_merchantId_createdAt_idx" ON "AiConversation"("merchantId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
