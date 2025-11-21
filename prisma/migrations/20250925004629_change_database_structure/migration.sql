/*
  Warnings:

  - You are about to drop the `_PublicationToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_PublicationToUser" DROP CONSTRAINT "_PublicationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PublicationToUser" DROP CONSTRAINT "_PublicationToUser_B_fkey";

-- DropTable
DROP TABLE "public"."_PublicationToUser";
