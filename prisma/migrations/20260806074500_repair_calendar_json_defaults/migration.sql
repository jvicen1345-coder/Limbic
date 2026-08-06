-- Data repair, not a schema change: same root cause as
-- 20260803010000_repair_json_defaults — add_professional_dates added two more Json-typed
-- columns (calendarEventIds, reminderPreferences) to an already-populated User table via a
-- table-rebuild, and the schema engine's raw `DEFAULT []` (unquoted, from `Json
-- @default("[]")`) doesn't evaluate to the text "[]" for rows carried over by the rebuild's
-- INSERT ... SELECT — it leaves them as empty string, which fails JSON deserialization on
-- every read of those rows. Prisma Client's own `create()` calls are unaffected (it sends
-- the literal "[]" itself rather than relying on the column default), so this only needed
-- fixing for rows that already existed before the migration ran.
UPDATE "User" SET "calendarEventIds" = '[]' WHERE "calendarEventIds" IS NULL OR "calendarEventIds" = '';
UPDATE "User" SET "reminderPreferences" = '[]' WHERE "reminderPreferences" IS NULL OR "reminderPreferences" = '';
