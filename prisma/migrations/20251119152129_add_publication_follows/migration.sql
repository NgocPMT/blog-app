-- CreateTable
CREATE TABLE "public"."PublicationFollow" (
    "publicationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "followAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicationFollow_publicationId_userId_key" ON "public"."PublicationFollow"("publicationId", "userId");

-- AddForeignKey
ALTER TABLE "public"."PublicationFollow" ADD CONSTRAINT "PublicationFollow_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "public"."Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicationFollow" ADD CONSTRAINT "PublicationFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
