import "server-only";
import { prisma } from "@/lib/db";
import { findArticleOgImage } from "@/lib/og-image";
import { planHomeImages } from "@/lib/home-image-plan";
import type { Article } from "@/lib/types";

/** Reads all relevant image rows in one query. This is the only image work Home awaits: no
 *  publisher or stock-photo request is made before the response can stream. */
export async function prepareHomeImages<T extends Article>(
  articles: T[]
): Promise<{ articles: T[]; toRefresh: T[] }> {
  const rows = await prisma.articleImageCache.findMany({
    where: { articleId: { in: articles.map((article) => article.id) } },
  });
  return planHomeImages(articles, rows);
}

/** Warms publisher images for the next Home load. Failures are persisted as a short-lived
 *  negative cache, preventing an unavailable publisher from being scraped on every visit. */
export async function refreshHomeImageCache(articles: Article[]): Promise<void> {
  await Promise.all(
    articles.map(async (article) => {
      if (!article.sourceUrl) return;
      try {
        const imageUrl = await findArticleOgImage(article);
        const data = { sourceUrl: article.sourceUrl, imageUrl, checkedAt: new Date() };
        await prisma.articleImageCache.upsert({
          where: { articleId: article.id },
          create: { articleId: article.id, ...data },
          update: data,
        });
      } catch (error) {
        console.error(`Failed to refresh image cache for ${article.id}`, error);
      }
    })
  );
}
