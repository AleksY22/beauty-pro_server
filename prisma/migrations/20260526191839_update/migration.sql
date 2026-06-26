/*
  Warnings:

  - Added the required column `updated_at` to the `attribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `variant_property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attribute" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "variant_property" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
