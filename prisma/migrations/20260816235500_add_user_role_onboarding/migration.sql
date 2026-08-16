-- AlterTable
ALTER TABLE "User" ADD COLUMN "userRole" TEXT;
ALTER TABLE "User" ADD COLUMN "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT true;
