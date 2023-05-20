-- DropForeignKey
ALTER TABLE "waterintakes" DROP CONSTRAINT "waterintakes_userId_fkey";

-- AddForeignKey
ALTER TABLE "waterintakes" ADD CONSTRAINT "waterintakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
