-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "licenseEmail" TEXT,
    "licenseExpiration" DATETIME,
    "email" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Dr. Amara Chen, PT',
    "specialty" TEXT NOT NULL DEFAULT 'ortho',
    "practiceState" TEXT NOT NULL DEFAULT 'California',
    "followedTopics" JSONB NOT NULL DEFAULT '[]',
    "ceCategories" JSONB NOT NULL DEFAULT '[]',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "studentTier" TEXT NOT NULL DEFAULT 'none',
    "lastVisitedAt" DATETIME,
    "lastReadAt" DATETIME,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "headline" TEXT,
    "bio" TEXT,
    "nexusOptIn" BOOLEAN NOT NULL DEFAULT false,
    "hiddenHomeWidgets" JSONB NOT NULL DEFAULT '[]',
    "hasOnboarded" BOOLEAN NOT NULL DEFAULT true,
    "lastBoardsActivityAt" DATETIME,
    "boardsStreakDays" INTEGER NOT NULL DEFAULT 0,
    "wellnessArticleIds" JSONB NOT NULL DEFAULT '[]',
    "wellnessVideoIds" JSONB NOT NULL DEFAULT '[]',
    "wellnessOpenedIds" JSONB NOT NULL DEFAULT '[]',
    "clipsSeenIds" JSONB NOT NULL DEFAULT '[]'
);
INSERT INTO "new_User" ("bio", "boardsStreakDays", "ceCategories", "clipsSeenIds", "createdAt", "email", "followedTopics", "headline", "hiddenHomeWidgets", "id", "isGuest", "isPro", "lastBoardsActivityAt", "lastReadAt", "lastVisitedAt", "licenseEmail", "licenseExpiration", "licenseNumber", "licenseState", "name", "nexusOptIn", "practiceState", "specialty", "streakDays", "studentTier", "wellnessArticleIds", "wellnessOpenedIds", "wellnessVideoIds") SELECT "bio", "boardsStreakDays", "ceCategories", "clipsSeenIds", "createdAt", "email", "followedTopics", "headline", "hiddenHomeWidgets", "id", "isGuest", "isPro", "lastBoardsActivityAt", "lastReadAt", "lastVisitedAt", "licenseEmail", "licenseExpiration", "licenseNumber", "licenseState", "name", "nexusOptIn", "practiceState", "specialty", "streakDays", "studentTier", "wellnessArticleIds", "wellnessOpenedIds", "wellnessVideoIds" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_licenseNumber_key" ON "User"("licenseNumber");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
