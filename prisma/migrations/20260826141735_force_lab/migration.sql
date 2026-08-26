-- AlterTable
ALTER TABLE "User" ADD COLUMN "forceUnit" TEXT;

-- CreateTable
CREATE TABLE "ForceLabSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "patientCode" TEXT,
    "patientId" TEXT,
    "muscleGroup" TEXT NOT NULL,
    "bodyRegion" TEXT NOT NULL,
    "rightPeak" REAL,
    "leftPeak" REAL,
    "rightTimeToPeak" REAL,
    "leftTimeToPeak" REAL,
    "difference" REAL,
    "percentDiff" REAL,
    "lsi" REAL,
    "unit" TEXT NOT NULL DEFAULT 'lbs',
    "notes" TEXT,
    "importedFrom" TEXT,
    "sessionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ForceLabSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForceLabSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "ClinicalPatient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForceLabNorm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "muscleGroup" TEXT NOT NULL,
    "bodyRegion" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "ageMin" INTEGER NOT NULL,
    "ageMax" INTEGER NOT NULL,
    "sex" TEXT NOT NULL,
    "meanLbs" REAL NOT NULL,
    "sdLbs" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
