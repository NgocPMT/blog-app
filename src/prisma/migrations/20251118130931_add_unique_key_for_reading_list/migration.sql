/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `ReadingList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReadingList_name_userId_key" ON "public"."ReadingList"("name", "userId");
