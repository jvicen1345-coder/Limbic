-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReadArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scrollProgress" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadArticle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReadArticle" ("articleId", "createdAt", "id", "userId") SELECT "articleId", "createdAt", "id", "userId" FROM "ReadArticle";
DROP TABLE "ReadArticle";
ALTER TABLE "new_ReadArticle" RENAME TO "ReadArticle";
CREATE UNIQUE INDEX "ReadArticle_userId_articleId_key" ON "ReadArticle"("userId", "articleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
