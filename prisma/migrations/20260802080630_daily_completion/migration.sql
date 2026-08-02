-- CreateTable
CREATE TABLE "DailyCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guesses" JSONB,
    "status" TEXT,
    "selectedIndex" INTEGER,
    "elapsedSeconds" INTEGER,
    CONSTRAINT "DailyCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCompletion_userId_kind_dateKey_key" ON "DailyCompletion"("userId", "kind", "dateKey");
