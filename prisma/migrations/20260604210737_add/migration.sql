/*
  Warnings:

  - You are about to drop the `brend` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "brend";

-- CreateTable
CREATE TABLE "promotion" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);
