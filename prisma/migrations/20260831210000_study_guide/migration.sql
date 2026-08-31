-- Study Guide (see components/student/StudyGuideManager.tsx): flashcards/notecards per
-- course, shared between the Flashcards and Self-Quiz tabs, plus a free-text Visual Aids
-- note per course. No production data exists for these pre-launch fields/tables.
ALTER TABLE "Syllabus" ADD COLUMN "studyNotes" TEXT;

-- CreateTable
CREATE TABLE "StudyCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastResult" TEXT,
    CONSTRAINT "StudyCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudyCard_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
