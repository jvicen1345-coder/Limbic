-- Health & Wellness daily streak (see src/lib/wellness-activity.ts), mirroring the Games
-- streak's GameActivity table and User columns.
--
-- Both columns take the same defaults every existing account would get from a fresh row,
-- so no backfill is needed: an account with no wellness activity yet reads 0 and a null
-- last-activity date, which nextStreak() already treats as "never active before".
CREATE TABLE "WellnessActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WellnessActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WellnessActivity_userId_dateKey_key" ON "WellnessActivity"("userId", "dateKey");

ALTER TABLE "User" ADD COLUMN "lastWellnessActivityAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "wellnessStreakDays" INTEGER NOT NULL DEFAULT 0;
