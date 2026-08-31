/*
  Warnings:

  - Renamed the `SyllabusAssignment` table to `Assignment` (broadened to also hold
    Canvas-sourced rows — see schema.prisma). Existing rows are copied across as
    source = 'syllabus' before the old table is dropped, so no assignment data is lost.

*/
-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT 'syllabus',
    "syllabusId" TEXT,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canvasAssignmentId" TEXT,
    "canvasCourseId" TEXT,
    "canvasHtmlUrl" TEXT,
    CONSTRAINT "Assignment_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CopyData
INSERT INTO "Assignment" ("id", "source", "syllabusId", "userId", "title", "dueDate", "category", "courseCode", "courseName", "completed", "completedAt", "createdAt")
SELECT "id", 'syllabus', "syllabusId", "userId", "title", "dueDate", "category", "courseCode", "courseName", "completed", "completedAt", "createdAt"
FROM "SyllabusAssignment";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SyllabusAssignment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CanvasConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "canvasUserId" TEXT,
    "canvasName" TEXT,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CanvasConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_userId_canvasAssignmentId_key" ON "Assignment"("userId", "canvasAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasConnection_userId_key" ON "CanvasConnection"("userId");
