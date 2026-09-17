-- Period-end for the Profile subscription card countdown (issue #493).
-- Nullable: existing subscribers stay null until their next Stripe webhook event.
-- No backfill — a null must render as plan + status with no countdown, never "0 days".
-- Additive ALTER works on both local SQLite and hosted Turso.
ALTER TABLE "User" ADD COLUMN "stripeCurrentPeriodEnd" DATETIME;
