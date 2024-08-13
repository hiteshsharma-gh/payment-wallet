/*
  Warnings:

  - The values [Github] on the enum `AuthType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthType_new" AS ENUM ('Google', 'Email');
ALTER TABLE "Account" ALTER COLUMN "authType" TYPE "AuthType_new" USING ("authType"::text::"AuthType_new");
ALTER TYPE "AuthType" RENAME TO "AuthType_old";
ALTER TYPE "AuthType_new" RENAME TO "AuthType";
DROP TYPE "AuthType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Merchant" DROP CONSTRAINT "Merchant_accountId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_accountId_fkey";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "password" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
