import "server-only";
import { prisma } from "@/lib/db";
import { nextStreak } from "@/lib/streak";

/** Marks today as a Limbic Games activity day (finishing Daily Term, Mini Crossword, or
 *  Case of the Day — any one counts) and advances the Games streak the same way
 *  lib/board-activity.ts recordBoardActivity does for the Boards streak. Idempotent per
 *  calendar day: finishing more than one game the same day only advances the streak once,
 *  since nextStreak() no-ops on a same-day repeat. Callers only invoke this once a game is
 *  actually finished, not on every in-progress save (see app/actions/daily-completion.ts). */
export async function recordGameActivity(userId: string, dateKey: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastGamesActivityAt: true, gamesStreakDays: true },
  });
  if (!user) return;
  const gamesStreakDays = nextStreak(user.lastGamesActivityAt, user.gamesStreakDays);
  await Promise.all([
    prisma.user.update({ where: { id: userId }, data: { lastGamesActivityAt: new Date(), gamesStreakDays } }),
    prisma.gameActivity.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      create: { userId, dateKey },
      update: {},
    }),
  ]);
}
