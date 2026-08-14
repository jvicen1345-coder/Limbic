-- AlterTable
ALTER TABLE "User" ADD COLUMN "ceLicenseExpiry" DATETIME;
ALTER TABLE "User" ADD COLUMN "ceRenewalCycle" INTEGER;
ALTER TABLE "User" ADD COLUMN "ceState" TEXT;
ALTER TABLE "User" ADD COLUMN "ceTotalRequired" REAL;

-- CreateTable
CREATE TABLE "CELog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "provider" TEXT,
    "completedAt" DATETIME NOT NULL,
    "hours" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CELog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
