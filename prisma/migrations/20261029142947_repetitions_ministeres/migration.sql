-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "ministryId" TEXT,
ADD COLUMN     "reminders" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
