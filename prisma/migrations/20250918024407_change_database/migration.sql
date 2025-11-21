/*
  Warnings:

  - You are about to drop the column `publicationId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_publicationId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "publicationId";

-- CreateTable
CREATE TABLE "public"."_PublicationToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PublicationToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PublicationToUser_B_index" ON "public"."_PublicationToUser"("B");

-- AddForeignKey
ALTER TABLE "public"."_PublicationToUser" ADD CONSTRAINT "_PublicationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PublicationToUser" ADD CONSTRAINT "_PublicationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
