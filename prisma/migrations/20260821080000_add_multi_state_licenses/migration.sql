-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attestation" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" DATETIME,
    CONSTRAINT "License_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill: every existing single-license submission (User.licenseStatus not null) becomes
-- its own License row, read from the old User columns before they're dropped below by the
-- RedefineTables step. A generated hex id stands in for Prisma's usual cuid() here since
-- this runs as raw SQL, not through the client.
INSERT INTO "License" ("id", "userId", "state", "licenseNumber", "fullName", "status", "attestation", "submittedAt", "verifiedAt")
SELECT
  lower(hex(randomblob(16))),
  "id",
  "licenseState",
  "licenseNumber",
  COALESCE("licenseFullName", "name"),
  "licenseStatus",
  "licenseAttestation",
  COALESCE("licenseSubmittedAt", CURRENT_TIMESTAMP),
  "licenseVerifiedAt"
FROM "User"
WHERE "licenseStatus" IS NOT NULL AND "licenseNumber" IS NOT NULL AND "licenseState" IS NOT NULL;

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
    "lastVisitedAt" DATETIME,
    "lastReadAt" DATETIME,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "headline" TEXT,
    "bio" TEXT,
    "nexusOptIn" BOOLEAN NOT NULL DEFAULT false,
    "hiddenHomeWidgets" JSONB NOT NULL DEFAULT [],
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT true,
    "userRole" TEXT,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT true,
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
    "calendarEventIds" JSONB NOT NULL DEFAULT [],
    "reminderPreferences" JSONB NOT NULL DEFAULT [],
    "ceState" TEXT,
    "ceLicenseExpiry" DATETIME,
    "ceRenewalCycle" INTEGER,
    "ceTotalRequired" REAL
);
INSERT INTO "new_User" ("accountMigrated", "backupEmail", "backupEmailAddedAt", "bio", "boardsSharpeningTargetSeconds", "boardsStreakDays", "calendarEventIds", "ceCategories", "ceLicenseExpiry", "ceRenewalCycle", "ceState", "ceTotalRequired", "certificationExpiry", "ceuDeadline", "clipsSeenIds", "createdAt", "email", "followedTopics", "foundingFunderBadgeHidden", "gamesStreakDays", "getTheAppDismissed", "googleId", "graduationDate", "graduationTransitionShownAt", "hasCompletedOnboarding", "hasOnboarded", "headline", "hiddenHomeWidgets", "homeGridSeenFingerprints", "id", "isGuest", "isPro", "isWellnessPlus", "lastBoardsActivityAt", "lastGamesActivityAt", "lastReadAt", "lastVisitedAt", "licenseEmail", "licenseExpiration", "licenseNumber", "licenseState", "llmInterestProfile", "llmInterestProfileUpdatedAt", "migrationDate", "migrationEmailSentAt", "name", "nexusOptIn", "npteExamDate", "passwordHash", "practiceStartDate", "practiceState", "reminderPreferences", "rotationEndDate", "rotationStartDate", "school", "specialty", "streakDays", "stripeCustomerId", "stripeSubscriptionId", "studentTier", "themePreference", "userRole", "wellnessArticleIds", "wellnessOpenedIds", "wellnessPlusInterval", "wellnessPlusSubscriptionId", "wellnessVideoIds") SELECT "accountMigrated", "backupEmail", "backupEmailAddedAt", "bio", "boardsSharpeningTargetSeconds", "boardsStreakDays", "calendarEventIds", "ceCategories", "ceLicenseExpiry", "ceRenewalCycle", "ceState", "ceTotalRequired", "certificationExpiry", "ceuDeadline", "clipsSeenIds", "createdAt", "email", "followedTopics", "foundingFunderBadgeHidden", "gamesStreakDays", "getTheAppDismissed", "googleId", "graduationDate", "graduationTransitionShownAt", "hasCompletedOnboarding", "hasOnboarded", "headline", "hiddenHomeWidgets", "homeGridSeenFingerprints", "id", "isGuest", "isPro", "isWellnessPlus", "lastBoardsActivityAt", "lastGamesActivityAt", "lastReadAt", "lastVisitedAt", "licenseEmail", "licenseExpiration", "licenseNumber", "licenseState", "llmInterestProfile", "llmInterestProfileUpdatedAt", "migrationDate", "migrationEmailSentAt", "name", "nexusOptIn", "npteExamDate", "passwordHash", "practiceStartDate", "practiceState", "reminderPreferences", "rotationEndDate", "rotationStartDate", "school", "specialty", "streakDays", "stripeCustomerId", "stripeSubscriptionId", "studentTier", "themePreference", "userRole", "wellnessArticleIds", "wellnessOpenedIds", "wellnessPlusInterval", "wellnessPlusSubscriptionId", "wellnessVideoIds" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_licenseNumber_key" ON "User"("licenseNumber");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_backupEmail_key" ON "User"("backupEmail");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
CREATE UNIQUE INDEX "User_wellnessPlusSubscriptionId_key" ON "User"("wellnessPlusSubscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseNumber_key" ON "License"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "License_userId_state_key" ON "License"("userId", "state");
