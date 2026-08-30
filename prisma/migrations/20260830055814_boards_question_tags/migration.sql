-- CreateTable
CREATE TABLE "BoardsQuestionTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "bodyRegions" TEXT NOT NULL DEFAULT '[]',
    "muscleGroups" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardsQuestionTag_questionId_key" ON "BoardsQuestionTag"("questionId");
