-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "enderecoEthereum" TEXT,
    "enderecoBitcoin" TEXT,
    "enderecoTron" TEXT,
    "enderecoSolana" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,
    "refreshToken" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "address" TEXT
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txid" TEXT,
    "userId" TEXT,
    "clientId" TEXT,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "convertedAmount" DECIMAL,
    "exchangeRate" DECIMAL,
    "asset" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaction_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaction_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    CONSTRAINT "address_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pix_charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txid" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "solicitacao" TEXT,
    "location" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "pix_charge_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pix_web_hook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txid" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "horarioCriacao" DATETIME NOT NULL,
    "horarioConclusao" DATETIME,
    "endToEndId" TEXT,
    "payload" JSONB NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pix_web_hook_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exchange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount_brl" REAL NOT NULL,
    "target_currency" TEXT NOT NULL,
    "target_amount" REAL NOT NULL,
    "market_rate" REAL NOT NULL,
    "used_rate" REAL NOT NULL,
    "profit_brl" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT,
    CONSTRAINT "Exchange_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_document_key" ON "client"("document");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_ownerId_ownerType_asset_key" ON "wallet"("ownerId", "ownerType", "asset");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_txid_key" ON "transaction"("txid");

-- CreateIndex
CREATE UNIQUE INDEX "pix_charge_txid_key" ON "pix_charge"("txid");

-- CreateIndex
CREATE UNIQUE INDEX "pix_web_hook_txid_key" ON "pix_web_hook"("txid");
