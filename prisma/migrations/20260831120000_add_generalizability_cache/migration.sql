-- CreateTable
CREATE TABLE "GeneralizabilityCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "scoreData" JSONB NOT NULL,
    "scoredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneralizabilityCache_articleId_key" ON "GeneralizabilityCache"("articleId");
