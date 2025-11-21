/*
  Warnings:

  - You are about to drop the column `published` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `readingListId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `reactionType` on the `PostReaction` table. All the data in the column will be lost.
  - You are about to drop the column `publicationRole` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_PostToTopic` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[postId,userId]` on the table `ReadingList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `reactionTypeId` to the `PostReaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postId` to the `ReadingList` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED');

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_readingListId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostReaction" DROP CONSTRAINT "PostReaction_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostReaction" DROP CONSTRAINT "PostReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PostToTopic" DROP CONSTRAINT "_PostToTopic_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PostToTopic" DROP CONSTRAINT "_PostToTopic_B_fkey";

-- DropIndex
DROP INDEX "public"."ReadingList_userId_key";

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "published",
DROP COLUMN "readingListId",
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "status" "public"."PostStatus" NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."PostReaction" DROP COLUMN "reactionType",
ADD COLUMN     "reactionTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Publication" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."ReadingList" ADD COLUMN     "postId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "publicationRole",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."_PostToTopic";

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" VARCHAR(160),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PublicationToUser" (
    "userId" INTEGER NOT NULL,
    "publicationId" INTEGER NOT NULL,
    "publicationRole" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."PostTopic" (
    "postId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "public"."PostView" (
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "public"."CommentReaction" (
    "commentId" INTEGER NOT NULL,
    "reactionTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "public"."ReactionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "reactionImageUrl" TEXT NOT NULL,

    CONSTRAINT "ReactionType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicationToUser_userId_publicationId_key" ON "public"."PublicationToUser"("userId", "publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTopic_postId_topicId_key" ON "public"."PostTopic"("postId", "topicId");

-- CreateIndex
CREATE INDEX "PostView_userId_idx" ON "public"."PostView"("userId");

-- CreateIndex
CREATE INDEX "PostView_viewedAt_idx" ON "public"."PostView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostView_postId_userId_key" ON "public"."PostView"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_userId_commentId_key" ON "public"."CommentReaction"("userId", "commentId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "public"."Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "public"."Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "public"."Post"("userId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "public"."Post"("status");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "public"."Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_publicationId_idx" ON "public"."Post"("publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingList_postId_userId_key" ON "public"."ReadingList"("postId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationToUser" ADD CONSTRAINT "PublicationToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationToUser" ADD CONSTRAINT "PublicationToUser_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingList" ADD CONSTRAINT "ReadingList_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTopic" ADD CONSTRAINT "PostTopic_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTopic" ADD CONSTRAINT "PostTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostView" ADD CONSTRAINT "PostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostReaction" ADD CONSTRAINT "PostReaction_reactionTypeId_fkey" FOREIGN KEY ("reactionTypeId") REFERENCES "public"."ReactionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_reactionTypeId_fkey" FOREIGN KEY ("reactionTypeId") REFERENCES "public"."ReactionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
