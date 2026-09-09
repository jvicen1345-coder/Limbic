-- Today's agent-written Home insight, stored per reader (see src/lib/daily-insight.ts).
-- Nullable with no default: an account without one falls back to a deterministic, still
-- sourced insight, so no backfill is needed.
ALTER TABLE "User" ADD COLUMN "dailyInsight" JSONB;
ALTER TABLE "User" ADD COLUMN "dailyInsightDate" TEXT;
