-- Focus timer (see src/app/actions/focus.ts): finished focus blocks, plus the recall notes
-- written after each block and their spaced-review schedule.
-- New tables only, no changes to existing rows, so this applies the same way on local
-- SQLite and hosted Turso.
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "syllabusId" TEXT,
    "subjectLabel" TEXT NOT NULL,
    "task" TEXT,
    "minutes" INTEGER NOT NULL,
    "dateKey" TEXT NOT NULL,
    "endedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FocusSession_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "FocusSession_userId_endedAt_idx" ON "FocusSession"("userId", "endedAt");

CREATE TABLE "RecallEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "syllabusId" TEXT,
    "subjectLabel" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "feedback" JSONB,
    "score" INTEGER,
    "reviewStage" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" DATETIME,
    "lastReviewedAt" DATETIME,
    "studyCardId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecallEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecallEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FocusSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RecallEntry_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "RecallEntry_userId_nextReviewAt_idx" ON "RecallEntry"("userId", "nextReviewAt");
CREATE INDEX "RecallEntry_userId_createdAt_idx" ON "RecallEntry"("userId", "createdAt");
