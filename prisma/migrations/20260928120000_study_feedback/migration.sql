-- Reader feedback on study breakdowns (see src/app/actions/study-feedback.ts).
-- New table only, so there is nothing to backfill; plain CREATE statements work on both
-- local SQLite and hosted Turso.
CREATE TABLE "StudyFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "useful" BOOLEAN NOT NULL DEFAULT false,
    "changesPractice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "StudyFeedback_userId_articleId_key" ON "StudyFeedback"("userId", "articleId");
CREATE INDEX "StudyFeedback_articleId_idx" ON "StudyFeedback"("articleId");
