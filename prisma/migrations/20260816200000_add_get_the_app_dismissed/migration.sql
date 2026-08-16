-- AlterTable
-- A plain ADD COLUMN (not the destructive drop+recreate Prisma's own migrate diff defaults
-- to for a NOT NULL column with a default) — SQLite allows adding a NOT NULL column
-- directly as long as it has a DEFAULT, which this does, so every existing row gets false
-- without needing a full table rebuild.
ALTER TABLE "User" ADD COLUMN "getTheAppDismissed" BOOLEAN NOT NULL DEFAULT false;
