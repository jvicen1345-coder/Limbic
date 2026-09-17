import { NEWS_ROW_TYPES } from "@/lib/home-feed-selection";
import type { DecoratedArticle } from "@/lib/feed";

/**
 * Home always shows a fixed card count (hero + gridArticles.length, e.g. 1 + 6 — see
 * MIN_HOME_CARDS/GRID_SIZE in lib/home-feed-selection.ts). That count has to hold even when
 * the hero actually on screen isn't the one gridArticles was deduped against server-side —
 * see HomeFeedInteractive's pinned-hero-across-Refresh case, where Refresh pins the old hero
 * in place while the grid is rebuilt from a fresh selection with no knowledge of it. Dropping
 * a hero-colliding card outright would quietly shrink the grid below that count, so each
 * collision is swapped for a same-type-class backfill candidate (preserving "All"'s
 * news-row-confined-to-the-end shape) that isn't already shown; if backfill genuinely runs
 * out (a very thin tab), the slot is dropped rather than showing a duplicate — same honest
 * degrade Home already accepts elsewhere ("Nothing with a picture… try refreshing").
 */
export function resolveGridArticles(
  gridArticles: DecoratedArticle[],
  gridBackfill: DecoratedArticle[],
  heroImages: Set<string>
): DecoratedArticle[] {
  const shownImages = new Set(heroImages);
  const backfillQueue = [...gridBackfill];
  const resolved: DecoratedArticle[] = [];

  for (const article of gridArticles) {
    if (!article.image || !heroImages.has(article.image)) {
      if (article.image) shownImages.add(article.image);
      resolved.push(article);
      continue;
    }
    const isNews = NEWS_ROW_TYPES.includes(article.type);
    const backfillIndex = backfillQueue.findIndex(
      (b) => b.image && !shownImages.has(b.image) && NEWS_ROW_TYPES.includes(b.type) === isNews
    );
    if (backfillIndex === -1) continue;
    const [replacement] = backfillQueue.splice(backfillIndex, 1);
    shownImages.add(replacement.image!);
    resolved.push(replacement);
  }
  return resolved;
}
