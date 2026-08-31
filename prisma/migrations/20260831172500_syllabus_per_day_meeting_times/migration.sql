-- Replaces the single shared meetingTime string with meetingTimes, a JSON-encoded map of
-- day code -> time (a course can meet at different times on different days). No production
-- data exists for this pre-launch field, so this is a straight drop/add rather than a
-- data-preserving copy.
ALTER TABLE "Syllabus" DROP COLUMN "meetingTime";
ALTER TABLE "Syllabus" ADD COLUMN "meetingTimes" TEXT;
