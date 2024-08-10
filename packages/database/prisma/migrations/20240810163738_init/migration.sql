-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('User', 'Merchant');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('Credentials', 'Google');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "auth_type" "AuthType" NOT NULL,
    "type" "AccountType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_key" ON "Account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
