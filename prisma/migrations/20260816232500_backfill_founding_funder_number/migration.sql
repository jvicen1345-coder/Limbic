-- Backfill: every already-confirmed FoundingFunder row gets a sequential
-- foundingFunderNumber, in order of confirmedAt (oldest first) — matches the same "count of
-- already-confirmed funders, plus one" rule newly-confirmed rows get going forward (see
-- lib/founding-funders.ts nextFoundingFunderNumber). Pending/failed rows are untouched
-- (stay NULL).
UPDATE "FoundingFunder"
SET "foundingFunderNumber" = (
  SELECT rn FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY confirmedAt ASC) AS rn
    FROM "FoundingFunder"
    WHERE paymentStatus = 'confirmed'
  ) sub
  WHERE sub.id = "FoundingFunder".id
)
WHERE paymentStatus = 'confirmed';
