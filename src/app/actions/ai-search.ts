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

async function currentSavedIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const rows = await prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } });
  return rows.map((r) => r.articleId);
}

export async function aiPubmedSearchAction(description: string): Promise<AiSearchResult> {
  const trimmed = description.trim();
  if (!trimmed) return { query: "", articles: [] };

  const [query, savedIds] = await Promise.all([generatePubmedQuery(trimmed), currentSavedIds()]);
  const results = await searchPubmed(query, 10);
  return { query, articles: results.map((a) => decorateArticle(a, savedIds)) };
}
