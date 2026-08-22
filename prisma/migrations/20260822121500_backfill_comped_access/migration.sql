-- The table-recreate in 20260822120000_add_comped_access declares "compedAccess" with
-- DEFAULT [], but SQLite parses unquoted square brackets as an (empty) quoted identifier
-- rather than the JSON text "[]" — every column added this way in this schema has the same
-- quirk (see followedTopics/ceCategories/etc.'s original migrations), it just goes unnoticed
-- until something actually selects that column for a row old enough to have only ever seen
-- the DB-level default rather than a real app write. Any row still holding that broken empty
-- string gets a real, valid "[]" here so compedAreas() (lib/session.ts) can safely parse it.
UPDATE "User" SET "compedAccess" = '[]' WHERE "compedAccess" = '' OR "compedAccess" IS NULL;
