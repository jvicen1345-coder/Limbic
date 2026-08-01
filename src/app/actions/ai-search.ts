"use server";

import { generatePubmedQuery } from "@/lib/ai-pubmed-query";
import { searchPubmed } from "@/lib/pubmed";
import { decorateArticle, type DecoratedArticle } from "@/lib/feed";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export interface AiSearchResult {
  query: string;
  articles: DecoratedArticle[];
}

export async function aiPubmedSearchAction(description: string): Promise<AiSearchResult> {
  const trimmed = description.trim();
  if (!trimmed) return { query: "", articles: [] };

  // Server-side enforcement, not just hiding the UI — SearchScreen only renders the form
  // for Pro users, but the action itself must not trust that.
  const user = await getCurrentUser();
  if (!user?.isPro) return { query: "", articles: [] };

  const [query, savedRows] = await Promise.all([
    generatePubmedQuery(trimmed),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  const results = await searchPubmed(query, 10);
  return { query, articles: results.map((a) => decorateArticle(a, savedIds)) };
}
