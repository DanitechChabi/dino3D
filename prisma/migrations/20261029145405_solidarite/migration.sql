-- CreateEnum
CREATE TYPE "SolidarityStatus" AS ENUM ('PROPOSED', 'OPEN', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SolidarityVisibility" AS ENUM ('PUBLIC', 'MEMBERS', 'ANONYMOUS');

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "solidarityId" TEXT;

-- CreateTable
CREATE TABLE "SolidarityCase" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "goal" INTEGER,
    "deadline" TIMESTAMP(3),
    "visibility" "SolidarityVisibility" NOT NULL DEFAULT 'MEMBERS',
    "status" "SolidarityStatus" NOT NULL DEFAULT 'PROPOSED',
    "forSelf" BOOLEAN NOT NULL DEFAULT false,
    "contactPhone" TEXT,
    "thanksMessage" TEXT,
    "requestedById" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolidarityCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolidarityPayout" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolidarityPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolidarityCase_slug_key" ON "SolidarityCase"("slug");

-- CreateIndex
CREATE INDEX "SolidarityCase_status_idx" ON "SolidarityCase"("status");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_solidarityId_fkey" FOREIGN KEY ("solidarityId") REFERENCES "SolidarityCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolidarityCase" ADD CONSTRAINT "SolidarityCase_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolidarityCase" ADD CONSTRAINT "SolidarityCase_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolidarityPayout" ADD CONSTRAINT "SolidarityPayout_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "SolidarityCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolidarityPayout" ADD CONSTRAINT "SolidarityPayout_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
