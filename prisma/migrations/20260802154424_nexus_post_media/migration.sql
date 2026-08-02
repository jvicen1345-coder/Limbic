-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NexusPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "body" TEXT NOT NULL,
    "articleTitle" TEXT,
    "imageUrls" JSONB NOT NULL DEFAULT '[]',
    "videoUrl" TEXT,
    "sourceUrl" TEXT,
    "sourceLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NexusPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NexusPost" ("authorId", "body", "createdAt", "id", "sourceLabel", "sourceUrl") SELECT "authorId", "body", "createdAt", "id", "sourceLabel", "sourceUrl" FROM "NexusPost";
DROP TABLE "NexusPost";
ALTER TABLE "new_NexusPost" RENAME TO "NexusPost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
