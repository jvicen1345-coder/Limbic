-- Data repair, not a schema change: wellness_rotation_and_saves and
-- clips_rotation_and_saves added Json-typed columns to an already-populated User table via
-- a table-rebuild (CREATE new_User + INSERT ... SELECT with the new columns omitted from
-- the SELECT list, relying on the column's DEFAULT to fill them in for carried-over rows).
-- That DEFAULT was declared as `DEFAULT '[]'` (correctly quoted) in the migration.sql, but
-- production is applied via scripts/apply-migrations.mjs, which runs each statement of a
-- migration individually against Turso's libSQL client rather than through Prisma's own
-- migration engine — a different execution path than local `prisma migrate deploy`, and
-- one that left these columns NULL or empty string for pre-existing rows instead of the
-- literal text "[]", which then fails JSON deserialization on every read of those rows
-- (breaking getCurrentUser() — and therefore nearly every page). This backfills them
-- directly rather than relying on the column DEFAULT a second time.
UPDATE "User" SET "wellnessArticleIds" = '[]' WHERE "wellnessArticleIds" IS NULL OR "wellnessArticleIds" = '';
UPDATE "User" SET "wellnessVideoIds" = '[]' WHERE "wellnessVideoIds" IS NULL OR "wellnessVideoIds" = '';
UPDATE "User" SET "wellnessOpenedIds" = '[]' WHERE "wellnessOpenedIds" IS NULL OR "wellnessOpenedIds" = '';
UPDATE "User" SET "clipsSeenIds" = '[]' WHERE "clipsSeenIds" IS NULL OR "clipsSeenIds" = '';
-- Defensive: these two have been in the schema since the very first migration (created
-- fresh, so never actually exposed to this bug), but the fix is free and rules them out.
UPDATE "User" SET "followedTopics" = '[]' WHERE "followedTopics" IS NULL OR "followedTopics" = '';
UPDATE "User" SET "ceCategories" = '[]' WHERE "ceCategories" IS NULL OR "ceCategories" = '';
