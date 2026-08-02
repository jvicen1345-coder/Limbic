-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedWellness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "date" TEXT,
    "readMins" INTEGER,
    "summary" TEXT,
    "duration" TEXT,
    CONSTRAINT "SavedWellness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedWellness" ("createdAt", "date", "duration", "id", "itemId", "kind", "readMins", "source", "sourceUrl", "summary", "title", "userId") SELECT "createdAt", "date", "duration", "id", "itemId", "kind", "readMins", "source", "sourceUrl", "summary", "title", "userId" FROM "SavedWellness";
DROP TABLE "SavedWellness";
ALTER TABLE "new_SavedWellness" RENAME TO "SavedWellness";
CREATE UNIQUE INDEX "SavedWellness_userId_itemId_key" ON "SavedWellness"("userId", "itemId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
