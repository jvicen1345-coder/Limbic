-- Backfill: any FoundingFunder row already confirmed (via the pre-Stripe manual Zelle
-- claim flow, before the paymentStatus column existed) gets paymentStatus/confirmedAt
-- synced up, rather than defaulting to "pending" and showing as an actionable pending row
-- in the new admin roster (see app/actions/founding-funders.ts, prisma/schema.prisma).
UPDATE "FoundingFunder" SET "paymentStatus" = 'confirmed', "confirmedAt" = "claimedAt" WHERE "confirmed" = true AND "paymentStatus" = 'pending';
