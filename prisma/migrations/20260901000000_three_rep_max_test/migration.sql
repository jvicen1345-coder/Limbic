-- CreateTable
CREATE TABLE "ThreeRepMaxTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "lift" TEXT NOT NULL,
    "weightLbs" REAL NOT NULL,
    "bodyweightLbs" REAL NOT NULL,
    "sex" TEXT NOT NULL,
    "testedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThreeRepMaxTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ThreeRepMaxTest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "ClinicalPatient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
