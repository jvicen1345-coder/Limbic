import "server-only";
import { prisma } from "@/lib/db";
import { nextStreak } from "@/lib/streak";

/** Marks an article as read for streak/"saved but still unread" purposes. Called from the
 *  article detail page on every view — cheap enough for this app's scale, and idempotent
 *  from the reader's perspective (re-reading the same day doesn't inflate the streak,
 *  reading the same article twice doesn't duplicate the ReadArticle row). */
export async function recordArticleRead(userId: string, articleId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { lastReadAt: true, streakDays: true } });
  if (!user) return;
  const streakDays = nextStreak(user.lastReadAt, user.streakDays);
  await Promise.all([
    prisma.user.update({ where: { id: userId }, data: { lastReadAt: new Date(), streakDays } }),
    prisma.readArticle.upsert({
      where: { userId_articleId: { userId, articleId } },
      create: { userId, articleId },
      update: {},
    }),
  ]);
}
