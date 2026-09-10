import "server-only";
import { prisma } from "@/lib/db";
import { nextStreak } from "@/lib/streak";

/** Marks today as a Health & Wellness activity day (logging an activity, checking in a
 *  mood, or saving a metric — any one counts) and advances the wellness streak exactly the
 *  way lib/game-activity.ts recordGameActivity does for Limbic Games. Idempotent per
 *  calendar day: doing all three the same day only advances the streak once, since
 *  nextStreak() no-ops on a same-day repeat.
 *
 *  `dateKey` is the reader's own calendar day (see lib/day.ts todayKeyInZone) rather than
 *  the date on the thing being logged. Backdating Monday's run on Wednesday still counts
 *  for Wednesday: the streak measures the days a reader turned up, and nextStreak() only
 *  moves forward — reaching back to repair a broken streak from a backdated entry is a
 *  different feature, and a more questionable one.
 *
 *  Called only from the server actions a reader triggers, never from the background health
 *  syncs that write the same tables — see the WellnessActivity model in
 *  prisma/schema.prisma for why. */
export async function recordWellnessActivity(userId: string, dateKey: string, timeZone: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastWellnessActivityAt: true, wellnessStreakDays: true },
  });
  if (!user) return;
  const wellnessStreakDays = nextStreak(user.lastWellnessActivityAt, user.wellnessStreakDays, timeZone, dateKey);
  await Promise.all([
    prisma.user.update({ where: { id: userId }, data: { lastWellnessActivityAt: new Date(), wellnessStreakDays } }),
    prisma.wellnessActivity.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      create: { userId, dateKey },
      update: {},
    }),
  ]);
}
