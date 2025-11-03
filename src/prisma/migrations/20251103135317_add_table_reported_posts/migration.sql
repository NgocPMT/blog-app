-- CreateTable
CREATE TABLE "public"."ReportedPosts" (
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportedPosts_postId_userId_key" ON "public"."ReportedPosts"("postId", "userId");

-- AddForeignKey
ALTER TABLE "public"."ReportedPosts" ADD CONSTRAINT "ReportedPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportedPosts" ADD CONSTRAINT "ReportedPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
