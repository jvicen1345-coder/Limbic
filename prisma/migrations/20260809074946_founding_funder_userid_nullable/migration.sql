-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoundingFunder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "credential" TEXT,
    "round" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL DEFAULT 40,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FoundingFunder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FoundingFunder" ("amount", "claimedAt", "confirmed", "credential", "displayName", "id", "round", "userId") SELECT "amount", "claimedAt", "confirmed", "credential", "displayName", "id", "round", "userId" FROM "FoundingFunder";
DROP TABLE "FoundingFunder";
ALTER TABLE "new_FoundingFunder" RENAME TO "FoundingFunder";
CREATE UNIQUE INDEX "FoundingFunder_userId_key" ON "FoundingFunder"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
