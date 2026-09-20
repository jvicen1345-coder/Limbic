-- The one playbook/guide slug a non-subscribed student picked to read for free (rework of
-- the student paid structuring: playbooks and Limbic Boards stay paid, everything else in
-- the student experience is free).
-- Nullable, no backfill — every existing account starts with no pick.
-- Additive ALTER works on both local SQLite and hosted Turso.
ALTER TABLE "User" ADD COLUMN "freePlaybookSlug" TEXT;
