/*
  Warnings:

  - The primary key for the `Merchant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `auth_type` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Merchant` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('User', 'Merchant');

-- AlterEnum
ALTER TYPE "AuthType" ADD VALUE 'Email';

-- DropIndex
DROP INDEX "Merchant_email_key";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_number_key";

-- AlterTable
ALTER TABLE "Merchant" DROP CONSTRAINT "Merchant_pkey",
DROP COLUMN "auth_type",
DROP COLUMN "email",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessName" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Merchant_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "email",
DROP COLUMN "number",
DROP COLUMN "password",
ADD COLUMN     "accountId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "authType" "AuthType" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "type" "AccountType" NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Token_accountId_key" ON "Token"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_accountId_key" ON "Merchant"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_key" ON "User"("accountId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
