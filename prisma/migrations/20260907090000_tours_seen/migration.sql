-- Which section tours an account has finished or skipped (see lib/tours.ts).
--
-- A JSON array of tour ids rather than a column per tour: tours are content, the set of them
-- changes with the app, and a migration per tour would be silly. hasCompletedTour is left
-- alone — it remains the gate for the one tour that starts on its own.
ALTER TABLE "User" ADD COLUMN "toursSeen" JSONB NOT NULL DEFAULT '[]';
