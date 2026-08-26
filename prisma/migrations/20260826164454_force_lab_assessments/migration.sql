Loaded Prisma config from prisma.config.ts.

-- CreateTable
CREATE TABLE "ForceLabAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "identifier" TEXT,
    "assessmentDate" DATETIME NOT NULL,
    "patientWeight" REAL,
    "patientWeightUnit" TEXT DEFAULT 'kg',
    "patientAge" INTEGER,
    "patientSex" TEXT,
    "dominantSide" TEXT,
    "musclesTested" INTEGER NOT NULL DEFAULT 0,
    "rawText" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ForceLabAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForceLabAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "ClinicalPatient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForceLabComparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assessmentAId" TEXT NOT NULL,
    "assessmentBId" TEXT NOT NULL,
    "interpretation" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForceLabComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForceLabComparison_assessmentAId_fkey" FOREIGN KEY ("assessmentAId") REFERENCES "ForceLabAssessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForceLabComparison_assessmentBId_fkey" FOREIGN KEY ("assessmentBId") REFERENCES "ForceLabAssessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ForceLabSession" (
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
    "assessmentId" TEXT,
    "averageForceLeft" REAL,
    "averageForceRight" REAL,
    "forceWeightRatioLeft" REAL,
    "forceWeightRatioRight" REAL,
    "rep1Left" REAL,
    "rep1Right" REAL,
    "rep2Left" REAL,
    "rep2Right" REAL,
    "rep3Left" REAL,
    "rep3Right" REAL,
    "timeToPeakAvgLeft" REAL,
    "timeToPeakAvgRight" REAL,
    CONSTRAINT "ForceLabSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForceLabSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "ClinicalPatient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ForceLabSession_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "ForceLabAssessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ForceLabSession" ("bodyRegion", "createdAt", "difference", "id", "importedFrom", "leftPeak", "leftTimeToPeak", "lsi", "muscleGroup", "notes", "patientCode", "patientId", "percentDiff", "rightPeak", "rightTimeToPeak", "sessionDate", "unit", "updatedAt", "userId") SELECT "bodyRegion", "createdAt", "difference", "id", "importedFrom", "leftPeak", "leftTimeToPeak", "lsi", "muscleGroup", "notes", "patientCode", "patientId", "percentDiff", "rightPeak", "rightTimeToPeak", "sessionDate", "unit", "updatedAt", "userId" FROM "ForceLabSession";
DROP TABLE "ForceLabSession";
ALTER TABLE "new_ForceLabSession" RENAME TO "ForceLabSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

