-- AlterTable
-- Plain ALTER TABLE ADD COLUMN with a quoted string-literal default, not a table-rebuild —
-- SQLite fills existing rows with the literal default text directly for this form, which
-- sidesteps the unquoted-`DEFAULT []`-in-a-rebuild bug documented in
-- 20260803010000_repair_json_defaults / 20260806074500_repair_calendar_json_defaults (that
-- bug only occurs when Prisma's migration engine regenerates the whole table via CREATE
-- new_User + INSERT ... SELECT).
ALTER TABLE "User" ADD COLUMN "homeGridSeenFingerprints" JSONB NOT NULL DEFAULT '[]';
