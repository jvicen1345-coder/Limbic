"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getArticleById } from "@/lib/articles";
import type { Article } from "@/lib/types";

/**
 * knownArticle is the article exactly as the reader is currently looking at it (see
 * components/SaveButton.tsx) — trusted here over re-resolving articleId from scratch,
 * since some context (e.g. a PubMed search re-tagging a PMID as type: "guideline" for a
 * practice-guideline search) only exists at search time and can't be recovered from the
 * id alone. A caller could in principle pass a fabricated snapshot, but the blast radius
 * is a user's own saved-list display for their own bookmark — not a cross-user or
 * privileged write — so that's an acceptable tradeoff for fixing the staleness bug.
 */
export async function toggleSaveAction(articleId: string, knownArticle?: Article) {
  const user = await getCurrentUser();
  if (!user) return;
  const existing = await prisma.savedArticle.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
  });
  if (existing) {
    await prisma.savedArticle.delete({ where: { id: existing.id } });
  } else {
    // Snapshot the article's display fields now, while it's still resolvable — a
    // live-sourced article (Google News/PubMed) isn't guaranteed to still be in a fresh
    // fetch by the time the reader revisits Saved Articles/Guidelines, so display can't
    // depend on re-resolving articleId indefinitely (see lib/articles.ts getArticleById).
    // Silently no-op for anything that doesn't resolve as an article (wellness, clips —
    // "clip-<id>" keys, Retraction Watch, etc.), same as before this snapshot existed.
    const article = knownArticle ?? (await getArticleById(articleId).catch(() => null));
    await prisma.savedArticle.create({
      data: {
        userId: user.id,
        articleId,
        ...(article && {
          type: article.type,
          specialty: article.specialty,
          title: article.title,
          source: article.source,
          sourceUrl: article.sourceUrl ?? null,
          date: article.date,
          readMins: article.readMins,
          summary: article.summary,
          tags: article.tags,
        }),
      },
    });
  }
  revalidatePath("/", "layout");
}
