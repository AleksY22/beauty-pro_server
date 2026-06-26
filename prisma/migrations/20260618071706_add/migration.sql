/*
  Warnings:

  - Added the required column `delivery_method_id` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method_id` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "address" TEXT,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "delivery_method_id" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "payment_method_id" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "delivery_method" (
    "id" TEXT NOT NULL,
    "code_method" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "instruction" TEXT,

    CONSTRAINT "delivery_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" TEXT NOT NULL,
    "code_method" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "instruction" TEXT,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_method_code_method_key" ON "delivery_method"("code_method");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_code_method_key" ON "payment_method"("code_method");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_delivery_method_id_fkey" FOREIGN KEY ("delivery_method_id") REFERENCES "delivery_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
