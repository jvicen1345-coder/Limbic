import "server-only";
import { prisma } from "@/lib/db";

/** Read side of reader feedback on study breakdowns (see the StudyFeedback model and
 *  app/actions/study-feedback.ts for the write side). */

export interface StudyFeedbackSummary {
  usefulCount: number;
  changesPracticeCount: number;
  mine: { useful: boolean; changesPractice: boolean } | null;
}

export async function getStudyFeedbackSummary(articleId: string, userId: string | null): Promise<StudyFeedbackSummary> {
  const [usefulCount, changesPracticeCount, mine] = await Promise.all([
    prisma.studyFeedback.count({ where: { articleId, useful: true } }),
    prisma.studyFeedback.count({ where: { articleId, changesPractice: true } }),
    userId
      ? prisma.studyFeedback.findUnique({
          where: { userId_articleId: { userId, articleId } },
          select: { useful: true, changesPractice: true },
        })
      : Promise.resolve(null),
  ]);
  return { usefulCount, changesPracticeCount, mine };
}

/** "Useful" votes per article, for ranking — one grouped query however many ids. */
export async function getUsefulCounts(articleIds: string[]): Promise<Record<string, number>> {
  if (articleIds.length === 0) return {};
  const rows = await prisma.studyFeedback.groupBy({
    by: ["articleId"],
    where: { articleId: { in: articleIds }, useful: true },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.articleId, r._count._all]));
}
