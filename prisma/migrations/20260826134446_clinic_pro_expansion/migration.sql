-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "planType" TEXT NOT NULL DEFAULT 'clinic_pro',
    "maxSeats" INTEGER NOT NULL DEFAULT 6,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Clinic_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClinicMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'clinician',
    "status" TEXT NOT NULL DEFAULT 'active',
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClinicMembership_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClinicMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "reason" TEXT,
    "transferredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientTransfer_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientTransfer_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "ClinicalPatient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientTransfer_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatientTransfer_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClinicOutcomeReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateRangeStart" DATETIME NOT NULL,
    "dateRangeEnd" DATETIME NOT NULL,
    "reportData" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL,
    CONSTRAINT "ClinicOutcomeReport_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClinicOutcomeReport_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClinicInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClinicInvite_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClinicalPatient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clinicId" TEXT,
    "patientCode" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "bodyRegion" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "totalVisits" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME,
    "nextVisit" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClinicalPatient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClinicalPatient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ClinicalPatient" ("bodyRegion", "condition", "createdAt", "id", "lastSeen", "nextVisit", "notes", "patientCode", "specialty", "startDate", "status", "totalVisits", "updatedAt", "userId", "visitCount") SELECT "bodyRegion", "condition", "createdAt", "id", "lastSeen", "nextVisit", "notes", "patientCode", "specialty", "startDate", "status", "totalVisits", "updatedAt", "userId", "visitCount" FROM "ClinicalPatient";
DROP TABLE "ClinicalPatient";
ALTER TABLE "new_ClinicalPatient" RENAME TO "ClinicalPatient";
CREATE UNIQUE INDEX "ClinicalPatient_userId_patientCode_key" ON "ClinicalPatient"("userId", "patientCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_adminUserId_key" ON "Clinic"("adminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicMembership_clinicId_userId_key" ON "ClinicMembership"("clinicId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicInvite_token_key" ON "ClinicInvite"("token");
