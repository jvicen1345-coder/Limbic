-- Co-admin access: which admin areas an account can open without being on the
-- FOUNDING_FUNDERS_ADMIN_EMAILS allowlist (see src/lib/admin-areas.ts).
--
-- A JSON array of area ids rather than a column per area, for the same reason toursSeen is:
-- the set of admin screens changes with the app. The default matches what every existing
-- row should mean — no delegated access — so no backfill is needed, and the env allowlist
-- keeps working exactly as it did for the owner accounts on it.
ALTER TABLE "User" ADD COLUMN "adminAreas" JSONB NOT NULL DEFAULT '[]';
