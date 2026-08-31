-- Room/location for a syllabus's recurring meeting pattern (see meetingDays/meetingTimes
-- above) — shown on the Atrium's Class Schedule strip alongside the meeting time. No
-- production data exists for this pre-launch field, so this is a straight column add.
ALTER TABLE "Syllabus" ADD COLUMN "location" TEXT;
