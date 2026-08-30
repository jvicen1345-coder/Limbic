-- CreateTable
CREATE TABLE "DPTProgram" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stateCode" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "calendarType" TEXT,
    "programLength" TEXT,
    "startTerm" TEXT,
    "totalCreditsRaw" TEXT,
    "creditsMin" REAL,
    "creditsMax" REAL,
    "clinicalWeeksRaw" TEXT,
    "clinicalWeeksMin" REAL,
    "clinicalWeeksMax" REAL,
    "accreditedSince" INTEGER,
    "notes" TEXT,
    "sourceDomain" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InstitutionalOutreach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_contacted',
    "contactName" TEXT,
    "contactEmail" TEXT,
    "lastContactedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstitutionalOutreach_programId_fkey" FOREIGN KEY ("programId") REFERENCES "DPTProgram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "licenseEmail" TEXT,
    "licenseExpiration" DATETIME,
    "email" TEXT,
    "backupEmail" TEXT,
    "backupEmailAddedAt" DATETIME,
    "migrationEmailSentAt" DATETIME,
    "accountMigrated" BOOLEAN NOT NULL DEFAULT false,
    "migrationDate" DATETIME,
    "name" TEXT NOT NULL DEFAULT 'Dr. Amara Chen, PT',
    "specialty" TEXT NOT NULL DEFAULT 'ortho',
    "practiceState" TEXT NOT NULL DEFAULT 'California',
    "school" TEXT,
    "clinicName" TEXT,
    "getTheAppDismissed" BOOLEAN NOT NULL DEFAULT false,
    "foundingFunderBadgeHidden" BOOLEAN NOT NULL DEFAULT false,
    "themePreference" TEXT NOT NULL DEFAULT 'system',
    "followedTopics" JSONB NOT NULL DEFAULT [],
    "ceCategories" JSONB NOT NULL DEFAULT [],
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "studentTier" TEXT NOT NULL DEFAULT 'none',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "isWellnessPlus" BOOLEAN NOT NULL DEFAULT false,
    "wellnessPlusInterval" TEXT,
    "wellnessPlusSubscriptionId" TEXT,
    "isClinicPro" BOOLEAN NOT NULL DEFAULT false,
    "clinicProSubscriptionId" TEXT,
    "compedAccess" JSONB NOT NULL DEFAULT [],
    "lastVisitedAt" DATETIME,
    "lastReadAt" DATETIME,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "headline" TEXT,
    "bio" TEXT,
    "nexusOptIn" BOOLEAN NOT NULL DEFAULT false,
    "hiddenHomeWidgets" JSONB NOT NULL DEFAULT [],
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT true,
    "hasSetName" BOOLEAN NOT NULL DEFAULT true,
    "userRole" TEXT,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT true,
    "hasCompletedTour" BOOLEAN NOT NULL DEFAULT true,
    "tourCompletedAt" DATETIME,
    "lastBoardsActivityAt" DATETIME,
    "boardsStreakDays" INTEGER NOT NULL DEFAULT 0,
    "boardsSharpeningTargetSeconds" INTEGER,
    "lastGamesActivityAt" DATETIME,
    "gamesStreakDays" INTEGER NOT NULL DEFAULT 0,
    "wellnessArticleIds" JSONB NOT NULL DEFAULT [],
    "wellnessVideoIds" JSONB NOT NULL DEFAULT [],
    "wellnessOpenedIds" JSONB NOT NULL DEFAULT [],
    "clipsSeenIds" JSONB NOT NULL DEFAULT [],
    "homeGridSeenFingerprints" JSONB NOT NULL DEFAULT [],
    "llmInterestProfile" JSONB,
    "llmInterestProfileUpdatedAt" DATETIME,
    "npteExamDate" DATETIME,
    "rotationStartDate" DATETIME,
    "rotationEndDate" DATETIME,
    "graduationDate" DATETIME,
    "graduationTransitionShownAt" DATETIME,
    "ceuDeadline" DATETIME,
    "certificationExpiry" DATETIME,
    "practiceStartDate" DATETIME,
    "dptProgramStart" TEXT,
    "dptGraduation" TEXT,
    "rotation1Site" TEXT,
    "rotation1City" TEXT,
    "rotation1Setting" TEXT,
    "rotation1Start" TEXT,
    "rotation1End" TEXT,
    "rotation1Supervisor" TEXT,
    "rotation2Site" TEXT,
    "rotation2City" TEXT,
    "rotation2Setting" TEXT,
    "rotation2Start" TEXT,
    "rotation2End" TEXT,
    "rotation2Supervisor" TEXT,
    "rotation3Site" TEXT,
    "rotation3City" TEXT,
    "rotation3Setting" TEXT,
    "rotation3Start" TEXT,
    "rotation3End" TEXT,
    "rotation3Supervisor" TEXT,
    "dptProgramId" INTEGER,
    "calendarEventIds" JSONB NOT NULL DEFAULT [],
    "reminderPreferences" JSONB NOT NULL DEFAULT [],
    "ceState" TEXT,
    "ceLicenseExpiry" DATETIME,
    "ceRenewalCycle" INTEGER,
    "ceTotalRequired" REAL,
    "forceUnit" TEXT,
    CONSTRAINT "User_dptProgramId_fkey" FOREIGN KEY ("dptProgramId") REFERENCES "DPTProgram" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountMigrated", "backupEmail", "backupEmailAddedAt", "bio", "boardsSharpeningTargetSeconds", "boardsStreakDays", "calendarEventIds", "ceCategories", "ceLicenseExpiry", "ceRenewalCycle", "ceState", "ceTotalRequired", "certificationExpiry", "ceuDeadline", "clinicName", "clinicProSubscriptionId", "clipsSeenIds", "compedAccess", "createdAt", "dptGraduation", "dptProgramStart", "email", "followedTopics", "forceUnit", "foundingFunderBadgeHidden", "gamesStreakDays", "getTheAppDismissed", "googleId", "graduationDate", "graduationTransitionShownAt", "hasCompletedOnboarding", "hasCompletedTour", "hasOnboarded", "hasSetName", "headline", "hiddenHomeWidgets", "homeGridSeenFingerprints", "id", "isClinicPro", "isGuest", "isPro", "isWellnessPlus", "lastBoardsActivityAt", "lastGamesActivityAt", "lastReadAt", "lastVisitedAt", "licenseEmail", "licenseExpiration", "licenseNumber", "licenseState", "llmInterestProfile", "llmInterestProfileUpdatedAt", "migrationDate", "migrationEmailSentAt", "name", "nexusOptIn", "npteExamDate", "passwordHash", "practiceStartDate", "practiceState", "reminderPreferences", "rotation1City", "rotation1End", "rotation1Setting", "rotation1Site", "rotation1Start", "rotation1Supervisor", "rotation2City", "rotation2End", "rotation2Setting", "rotation2Site", "rotation2Start", "rotation2Supervisor", "rotation3City", "rotation3End", "rotation3Setting", "rotation3Site", "rotation3Start", "rotation3Supervisor", "rotationEndDate", "rotationStartDate", "school", "specialty", "streakDays", "stripeCustomerId", "stripeSubscriptionId", "studentTier", "themePreference", "tourCompletedAt", "userRole", "wellnessArticleIds", "wellnessOpenedIds", "wellnessPlusInterval", "wellnessPlusSubscriptionId", "wellnessVideoIds") SELECT "accountMigrated", "backupEmail", "backupEmailAddedAt", "bio", "boardsSharpeningTargetSeconds", "boardsStreakDays", "calendarEventIds", "ceCategories", "ceLicenseExpiry", "ceRenewalCycle", "ceState", "ceTotalRequired", "certificationExpiry", "ceuDeadline", "clinicName", "clinicProSubscriptionId", "clipsSeenIds", "compedAccess", "createdAt", "dptGraduation", "dptProgramStart", "email", "followedTopics", "forceUnit", "foundingFunderBadgeHidden", "gamesStreakDays", "getTheAppDismissed", "googleId", "graduationDate", "graduationTransitionShownAt", "hasCompletedOnboarding", "hasCompletedTour", "hasOnboarded", "hasSetName", "headline", "hiddenHomeWidgets", "homeGridSeenFingerprints", "id", "isClinicPro", "isGuest", "isPro", "isWellnessPlus", "lastBoardsActivityAt", "lastGamesActivityAt", "lastReadAt", "lastVisitedAt", "licenseEmail", "licenseExpiration", "licenseNumber", "licenseState", "llmInterestProfile", "llmInterestProfileUpdatedAt", "migrationDate", "migrationEmailSentAt", "name", "nexusOptIn", "npteExamDate", "passwordHash", "practiceStartDate", "practiceState", "reminderPreferences", "rotation1City", "rotation1End", "rotation1Setting", "rotation1Site", "rotation1Start", "rotation1Supervisor", "rotation2City", "rotation2End", "rotation2Setting", "rotation2Site", "rotation2Start", "rotation2Supervisor", "rotation3City", "rotation3End", "rotation3Setting", "rotation3Site", "rotation3Start", "rotation3Supervisor", "rotationEndDate", "rotationStartDate", "school", "specialty", "streakDays", "stripeCustomerId", "stripeSubscriptionId", "studentTier", "themePreference", "tourCompletedAt", "userRole", "wellnessArticleIds", "wellnessOpenedIds", "wellnessPlusInterval", "wellnessPlusSubscriptionId", "wellnessVideoIds" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_licenseNumber_key" ON "User"("licenseNumber");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_backupEmail_key" ON "User"("backupEmail");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
CREATE UNIQUE INDEX "User_wellnessPlusSubscriptionId_key" ON "User"("wellnessPlusSubscriptionId");
CREATE UNIQUE INDEX "User_clinicProSubscriptionId_key" ON "User"("clinicProSubscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DPTProgram_stateCode_idx" ON "DPTProgram"("stateCode");

-- CreateIndex
CREATE INDEX "DPTProgram_region_idx" ON "DPTProgram"("region");

-- CreateIndex
CREATE INDEX "DPTProgram_institution_idx" ON "DPTProgram"("institution");
