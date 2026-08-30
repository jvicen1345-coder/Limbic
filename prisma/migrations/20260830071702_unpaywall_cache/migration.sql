-- CreateTable
CREATE TABLE "UnpaywallCache" (
    "doi" TEXT NOT NULL PRIMARY KEY,
    "isOpenAccess" BOOLEAN NOT NULL,
    "oaStatus" TEXT NOT NULL,
    "bestOaLocation" TEXT,
    "title" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
