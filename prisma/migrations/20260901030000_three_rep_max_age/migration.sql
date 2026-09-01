-- AlterTable
-- DEFAULT 30 exists only to satisfy SQLite's requirement that a NOT NULL column added via
-- ALTER TABLE have a default — no rows exist yet (this is pre-launch, dev-only data) and
-- every future insert supplies age explicitly (see createThreeRepMaxTest in
-- app/actions/three-rep-max.ts), so the default is never actually relied on.
ALTER TABLE "ThreeRepMaxTest" ADD COLUMN "age" INTEGER NOT NULL DEFAULT 30;
