-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "publicationId" INTEGER,
ADD COLUMN     "readingListId" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "publicationId" INTEGER,
ADD COLUMN     "publicationRole" TEXT,
ADD COLUMN     "role" TEXT,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Publication" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadingList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ReadingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostReaction" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "reactionType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Topic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserFollows" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserFollows_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_PostToTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PostToTopic_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Publication_name_key" ON "public"."Publication"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerUserId_key" ON "public"."Account"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingList_userId_key" ON "public"."ReadingList"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_userId_postId_key" ON "public"."PostReaction"("userId", "postId");

-- CreateIndex
CREATE INDEX "_UserFollows_B_index" ON "public"."_UserFollows"("B");

-- CreateIndex
CREATE INDEX "_PostToTopic_B_index" ON "public"."_PostToTopic"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingList" ADD CONSTRAINT "ReadingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_readingListId_fkey" FOREIGN KEY ("readingListId") REFERENCES "public"."ReadingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserFollows" ADD CONSTRAINT "_UserFollows_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserFollows" ADD CONSTRAINT "_UserFollows_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PostToTopic" ADD CONSTRAINT "_PostToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PostToTopic" ADD CONSTRAINT "_PostToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
