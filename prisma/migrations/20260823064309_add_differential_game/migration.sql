-- CreateTable
CREATE TABLE "DifferentialCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateKey" TEXT NOT NULL,
    "caseIndex" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "clues" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DifferentialResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "cluesUsed" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "guesses" JSONB NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DifferentialResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DifferentialCase_dateKey_key" ON "DifferentialCase"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "DifferentialResult_userId_dateKey_key" ON "DifferentialResult"("userId", "dateKey");
