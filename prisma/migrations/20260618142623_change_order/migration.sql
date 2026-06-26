/*
  Warnings:

  - You are about to drop the column `code_method` on the `delivery_method` table. All the data in the column will be lost.
  - You are about to drop the column `code_method` on the `payment_method` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `delivery_method` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `payment_method` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `delivery_method` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `payment_method` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "delivery_method_code_method_key";

-- DropIndex
DROP INDEX "payment_method_code_method_key";

-- AlterTable
ALTER TABLE "delivery_method" DROP COLUMN "code_method",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payment_method" DROP COLUMN "code_method",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "delivery_method_code_key" ON "delivery_method"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_code_key" ON "payment_method"("code");
