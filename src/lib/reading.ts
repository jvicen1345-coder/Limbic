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
    // `update: {}` still bumps updatedAt (see schema.prisma's @updatedAt on ReadArticle) —
    // a bare re-open counts as "touched most recently" for Continue Reading purposes even
    // without a fresh scroll-progress report.
    prisma.readArticle.upsert({
      where: { userId_articleId: { userId, articleId } },
      create: { userId, articleId },
      update: {},
    }),
  ]);
}

/** Reported by components/ReadingProgressTracker.tsx as the reader scrolls an article —
 *  drives the Home page "Continue Reading" card (see components/ContinueReadingCard.tsx).
 *  Only ever moves a reader's progress forward: an article revisited from the start
 *  shouldn't erase how far they'd previously gotten before they scroll past that point
 *  again. No-ops silently if the ReadArticle row doesn't exist yet — the tracker can't
 *  run before recordArticleRead's upsert has created it (article page awaits that first).
 */
export async function updateReadingProgress(userId: string, articleId: string, progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  const existing = await prisma.readArticle.findUnique({ where: { userId_articleId: { userId, articleId } } });
  if (!existing || clamped <= existing.scrollProgress) return;
  await prisma.readArticle.update({
    where: { userId_articleId: { userId, articleId } },
    data: { scrollProgress: clamped },
  });
}
