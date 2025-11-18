/*
  Warnings:

  - You are about to drop the column `parentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `relatedId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `publicationRole` on the `PublicationToUser` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `ReadingList` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PublicationFollow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserFollows` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `ReactionType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actorId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ReadingList` table without a default value. This is not possible if the table is not empty.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'NEW_FOLLOW';

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentReaction" DROP CONSTRAINT "CommentReaction_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentReaction" DROP CONSTRAINT "CommentReaction_reactionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentReaction" DROP CONSTRAINT "CommentReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PublicationFollow" DROP CONSTRAINT "PublicationFollow_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PublicationFollow" DROP CONSTRAINT "PublicationFollow_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PublicationToUser" DROP CONSTRAINT "PublicationToUser_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PublicationToUser" DROP CONSTRAINT "PublicationToUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReadingList" DROP CONSTRAINT "ReadingList_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserFollows" DROP CONSTRAINT "UserFollows_followedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserFollows" DROP CONSTRAINT "UserFollows_followingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserFollows" DROP CONSTRAINT "_UserFollows_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserFollows" DROP CONSTRAINT "_UserFollows_B_fkey";

-- DropIndex
DROP INDEX "public"."Comment_parentId_idx";

-- DropIndex
DROP INDEX "public"."Publication_name_key";

-- DropIndex
DROP INDEX "public"."ReadingList_postId_userId_key";

-- AlterTable
ALTER TABLE "public"."Comment" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "relatedId",
DROP COLUMN "title",
ADD COLUMN     "actorId" INTEGER NOT NULL,
ADD COLUMN     "postId" INTEGER,
ADD COLUMN     "publicationInvitationId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Publication" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "isActive",
DROP COLUMN "logoUrl",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT;

-- AlterTable
ALTER TABLE "public"."PublicationToUser" DROP COLUMN "publicationRole",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."ReadingList" DROP COLUMN "postId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Topic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."CommentReaction";

-- DropTable
DROP TABLE "public"."PublicationFollow";

-- DropTable
DROP TABLE "public"."_UserFollows";

-- CreateTable
CREATE TABLE "public"."PublicationInvitation" (
    "id" SERIAL NOT NULL,
    "publicationId" INTEGER NOT NULL,
    "inviterId" INTEGER NOT NULL,
    "inviteeId" INTEGER NOT NULL,
    "status" "public"."InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "PublicationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SavedPost" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" INTEGER NOT NULL,
    "readingListId" INTEGER NOT NULL,

    CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedPost_readingListId_idx" ON "public"."SavedPost"("readingListId");

-- CreateIndex
CREATE INDEX "SavedPost_postId_idx" ON "public"."SavedPost"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPost_postId_readingListId_key" ON "public"."SavedPost"("postId", "readingListId");

-- CreateIndex
CREATE UNIQUE INDEX "ReactionType_name_key" ON "public"."ReactionType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "public"."Topic"("name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."PublicationToUser" ADD CONSTRAINT "PublicationToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationToUser" ADD CONSTRAINT "PublicationToUser_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationInvitation" ADD CONSTRAINT "PublicationInvitation_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationInvitation" ADD CONSTRAINT "PublicationInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationInvitation" ADD CONSTRAINT "PublicationInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFollows" ADD CONSTRAINT "UserFollows_followedById_fkey" FOREIGN KEY ("followedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."UserFollows" ADD CONSTRAINT "UserFollows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_publicationInvitationId_fkey" FOREIGN KEY ("publicationInvitationId") REFERENCES "public"."PublicationInvitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedPost" ADD CONSTRAINT "SavedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedPost" ADD CONSTRAINT "SavedPost_readingListId_fkey" FOREIGN KEY ("readingListId") REFERENCES "public"."ReadingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
