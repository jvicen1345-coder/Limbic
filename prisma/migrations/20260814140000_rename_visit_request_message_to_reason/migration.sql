-- RenameColumn
-- Preserves any already-submitted request's free-text content under the new column name
-- (RENAME COLUMN, not a drop-and-recreate) rather than silently discarding it — see the
-- commit message for why a straight column rename was used instead of Prisma's own
-- generated migrate diff for this change (which drops and recreates the table, losing data).
ALTER TABLE "ConnexionVisitRequest" RENAME COLUMN "message" TO "visitReason";
