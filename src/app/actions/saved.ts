"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getArticleById } from "@/lib/articles";

export async function toggleSaveAction(articleId: string) {
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
    const article = await getArticleById(articleId).catch(() => null);
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
