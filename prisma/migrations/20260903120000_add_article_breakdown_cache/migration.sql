-- CreateTable
CREATE TABLE "ArticleBreakdownCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "breakdownData" JSONB NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleBreakdownCache_articleId_key" ON "ArticleBreakdownCache"("articleId");
