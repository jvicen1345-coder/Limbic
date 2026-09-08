import type { Article } from "@/lib/types";
import { attachBundledTopicImages } from "@/lib/topic-photos";

const FOUND_IMAGE_STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
const MISSING_IMAGE_STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export interface ArticleImageCacheRow {
  articleId: string;
  sourceUrl: string;
  imageUrl: string | null;
  checkedAt: Date;
}

function canWarm(article: Article): article is Article & { sourceUrl: string } {
  if (!article.sourceUrl) return false;
  try {
    const url = new URL(article.sourceUrl);
    return url.hostname !== "news.google.com" && !url.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

/** Pure cache policy for Home images. Cached publisher images win, while every unresolved
 *  card receives a deterministic bundled photo immediately. The returned refresh list is
 *  safe to process after the response and excludes fresh negative-cache entries. */
export function planHomeImages<T extends Article>(
  articles: T[],
  rows: ArticleImageCacheRow[],
  now = new Date()
): { articles: T[]; toRefresh: T[] } {
  const rowsByArticleId = new Map(rows.map((row) => [row.articleId, row]));
  const toRefresh: T[] = [];
  const claimedImages = new Set(
    articles.map((article) => article.image).filter((image): image is string => Boolean(image))
  );

  const cached = articles.map((article) => {
    if (article.image || !canWarm(article)) return article;

    const row = rowsByArticleId.get(article.id);
    const maxAge = row?.imageUrl ? FOUND_IMAGE_STALE_AFTER_MS : MISSING_IMAGE_STALE_AFTER_MS;
    const isFresh =
      row?.sourceUrl === article.sourceUrl &&
      now.getTime() - row.checkedAt.getTime() < maxAge;

    if (!isFresh) toRefresh.push(article);
    if (!isFresh || !row.imageUrl || claimedImages.has(row.imageUrl)) return article;
    claimedImages.add(row.imageUrl);
    return { ...article, image: row.imageUrl };
  });

  return { articles: attachBundledTopicImages(cached), toRefresh };
}
