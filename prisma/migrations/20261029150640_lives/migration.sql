-- CreateEnum
CREATE TYPE "LiveStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LivePlatform" AS ENUM ('YOUTUBE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "Livestream" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "preacher" TEXT,
    "series" TEXT,
    "scripture" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "status" "LiveStatus" NOT NULL DEFAULT 'SCHEDULED',
    "platform" "LivePlatform" NOT NULL DEFAULT 'YOUTUBE',
    "url" TEXT,
    "videoId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Livestream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Livestream_slug_key" ON "Livestream"("slug");

-- CreateIndex
CREATE INDEX "Livestream_status_scheduledAt_idx" ON "Livestream"("status", "scheduledAt");
