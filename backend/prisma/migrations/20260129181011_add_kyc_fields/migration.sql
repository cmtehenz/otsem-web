-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "enderecoEthereum" TEXT,
    "enderecoBitcoin" TEXT,
    "enderecoTron" TEXT,
    "enderecoSolana" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,
    "refreshToken" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "kycLevel" TEXT NOT NULL DEFAULT 'PENDING',
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_client" ("createdAt", "document", "email", "enderecoBitcoin", "enderecoEthereum", "enderecoSolana", "enderecoTron", "fileName", "filePath", "id", "name", "password", "phone", "refreshToken", "role", "type", "updatedAt") SELECT "createdAt", "document", "email", "enderecoBitcoin", "enderecoEthereum", "enderecoSolana", "enderecoTron", "fileName", "filePath", "id", "name", "password", "phone", "refreshToken", "role", "type", "updatedAt" FROM "client";
DROP TABLE "client";
ALTER TABLE "new_client" RENAME TO "client";
CREATE UNIQUE INDEX "client_document_key" ON "client"("document");
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
