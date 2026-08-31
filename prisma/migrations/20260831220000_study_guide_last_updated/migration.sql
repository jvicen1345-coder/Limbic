-- "Updated Xh ago" signal on the Study Guide index (see getStudyGuideCourses in
-- app/actions/study-guide.ts) — stamped only when Study Guide Creator's AI extraction
-- actually writes new content for a course (see writeSlideBreakdown in
-- app/actions/slide-breakdown.ts), not by manual edits. No production data exists for
-- this pre-launch field, so this is a straight column add.
ALTER TABLE "Syllabus" ADD COLUMN "studyContentUpdatedAt" DATETIME;
