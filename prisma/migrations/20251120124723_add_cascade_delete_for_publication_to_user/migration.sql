-- DropForeignKey
ALTER TABLE "public"."PublicationToUser" DROP CONSTRAINT "PublicationToUser_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PublicationToUser" DROP CONSTRAINT "PublicationToUser_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."PublicationToUser" ADD CONSTRAINT "PublicationToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationToUser" ADD CONSTRAINT "PublicationToUser_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
