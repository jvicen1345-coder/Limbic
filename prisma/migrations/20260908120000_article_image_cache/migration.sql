-- CreateTable
CREATE TABLE "ArticleImageCache" (
    "articleId" TEXT NOT NULL PRIMARY KEY,
    "sourceUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
