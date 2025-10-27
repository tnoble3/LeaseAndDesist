-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken" ("userId");
