"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getStudyFeedbackSummary, type StudyFeedbackSummary } from "@/lib/study-feedback";

const ARTICLE_ID_RE = /^[A-Za-z0-9_-]{1,120}$/;

/** Sets one of the reader's two flags on a study ("useful", "would change my practice")
 *  and returns the fresh totals. Idempotent: the client sends the value it wants, not a
 *  toggle, so a double tap can't flip it back. */
export async function setStudyFeedbackAction(
  articleId: string,
  field: "useful" | "changesPractice",
  value: boolean
): Promise<{ ok: true; summary: StudyFeedbackSummary } | { ok: false }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (!ARTICLE_ID_RE.test(articleId)) return { ok: false };
  if (field !== "useful" && field !== "changesPractice") return { ok: false };

  await prisma.studyFeedback.upsert({
    where: { userId_articleId: { userId: user.id, articleId } },
    create: { userId: user.id, articleId, [field]: value === true },
    update: { [field]: value === true },
  });
  return { ok: true, summary: await getStudyFeedbackSummary(articleId, user.id) };
}
