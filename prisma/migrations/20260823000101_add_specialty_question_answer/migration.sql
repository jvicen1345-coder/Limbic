-- CreateTable
CREATE TABLE "SpecialtyQuestionAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateKey" TEXT NOT NULL,
    CONSTRAINT "SpecialtyQuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialtyQuestionAnswer_userId_specialty_questionIndex_dateKey_key" ON "SpecialtyQuestionAnswer"("userId", "specialty", "questionIndex", "dateKey");
