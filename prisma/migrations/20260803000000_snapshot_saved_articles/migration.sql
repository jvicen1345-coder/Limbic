-- AlterTable
ALTER TABLE "SavedArticle" ADD COLUMN "date" TEXT;
ALTER TABLE "SavedArticle" ADD COLUMN "readMins" INTEGER;
ALTER TABLE "SavedArticle" ADD COLUMN "source" TEXT;
ALTER TABLE "SavedArticle" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "SavedArticle" ADD COLUMN "specialty" TEXT;
ALTER TABLE "SavedArticle" ADD COLUMN "summary" TEXT;
ALTER TABLE "SavedArticle" ADD COLUMN "tags" JSONB;
ALTER TABLE "SavedArticle" ADD COLUMN "title" TEXT;
ALTER TABLE "SavedArticle" ADD COLUMN "type" TEXT;

