-- CreateTable
CREATE TABLE "AnatomyConnectPuzzle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateKey" TEXT NOT NULL,
    "puzzle" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnatomyConnectResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "solved" BOOLEAN NOT NULL,
    "attempts" INTEGER NOT NULL,
    "timeSeconds" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnatomyConnectResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AnatomyConnectPuzzle_dateKey_key" ON "AnatomyConnectPuzzle"("dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "AnatomyConnectResult_userId_dateKey_key" ON "AnatomyConnectResult"("userId", "dateKey");
