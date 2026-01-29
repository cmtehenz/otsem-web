-- CreateTable
CREATE TABLE "merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "legalName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "bankHolderName" TEXT,
    "bankDoc" TEXT,
    "bank" TEXT,
    "bankAgency" TEXT,
    "bankAccount" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "monthlyLimitBRL" INTEGER NOT NULL DEFAULT 30000
);

-- CreateTable
CREATE TABLE "payment_intent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "merchantId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountBRL" INTEGER NOT NULL,
    "installmentsMax" INTEGER NOT NULL,
    "interestMode" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "checkoutUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "payment_intent_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "webhook_event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "rawBody" JSONB NOT NULL,
    "signature" TEXT,
    "relatedId" TEXT
);
