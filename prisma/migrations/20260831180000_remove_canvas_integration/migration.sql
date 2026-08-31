-- Removes the Canvas LMS integration: drops the CanvasConnection table and the
-- Canvas-specific columns/index on Assignment. Any Canvas-sourced Assignment rows are
-- deleted along with the source column, since there is no longer any code path that
-- distinguishes syllabus- from Canvas-sourced assignments.
DELETE FROM "Assignment" WHERE "source" = 'canvas';

DROP TABLE "CanvasConnection";

DROP INDEX "Assignment_userId_canvasAssignmentId_key";

ALTER TABLE "Assignment" DROP COLUMN "source";
ALTER TABLE "Assignment" DROP COLUMN "canvasAssignmentId";
ALTER TABLE "Assignment" DROP COLUMN "canvasCourseId";
ALTER TABLE "Assignment" DROP COLUMN "canvasHtmlUrl";
