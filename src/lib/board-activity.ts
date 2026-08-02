import "server-only";
import { prisma } from "@/lib/db";
import { nextStreak } from "@/lib/streak";

/** Marks today as a Limbic Boards activity day (viewing the daily term, answering the
 *  daily question — either counts) and advances the Boards streak the same way
 *  lib/reading.ts recordArticleRead does for the reading streak. Idempotent per calendar
 *  day: revealing the term and then answering the question the same day only advances the
 *  streak once, since nextStreak() no-ops on a same-day repeat. */
export async function recordBoardActivity(userId: string, dateKey: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastBoardsActivityAt: true, boardsStreakDays: true },
  });
  if (!user) return;
  const boardsStreakDays = nextStreak(user.lastBoardsActivityAt, user.boardsStreakDays);
  await Promise.all([
    prisma.user.update({ where: { id: userId }, data: { lastBoardsActivityAt: new Date(), boardsStreakDays } }),
    prisma.boardActivity.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      create: { userId, dateKey },
      update: {},
    }),
  ]);
}
