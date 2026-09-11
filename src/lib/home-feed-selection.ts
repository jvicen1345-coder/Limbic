import { orderArticlesForGrid } from "@/lib/home-grid-rotation";
import type { DecoratedArticle } from "@/lib/feed";
import type { ArticleType } from "@/lib/types";
import { slugifyTopic } from "@/lib/topic-slug";

/** How many of the top-ranked articles the hero rotates through. */
export const HERO_SIZE = 5;

/**
 * No pagination — the middle panel (hero + grid) always shows at least this many cards.
 * Every one needs a real picture (see home/page.tsx's prepareHomeImages); Refresh is the
 * intended way a reader waits through a thin/unlucky batch rather than paging past it.
 */
export const MIN_HOME_CARDS = 7;

/**
 * The grid's normal size when the hero is showing (1 hero + 6 grid = MIN_HOME_CARDS). If
 * the hero pool comes up empty, the grid grows to MIN_HOME_CARDS on its own.
 */
export const GRID_SIZE = MIN_HOME_CARDS - 1;

/**
 * The Research tab specifically gets a taller grid than every other tab — PubMed's fetch
 * comfortably supports more than MIN_HOME_CARDS. Every other tab stays at the tighter
 * default on purpose (Guidelines only has 8 real CPGs; CE & Events has no live source).
 */
export const RESEARCH_GRID_SIZE = 14;

/** PubMed research and curated AOPT clinical practice guidelines. */
export const MEDICAL_TYPES: ArticleType[] = ["research", "guideline"];

/** Only a medical source may hold the hero, even on the "All" tab. */
export const HERO_ELIGIBLE_TYPES: ArticleType[] = MEDICAL_TYPES;

/**
 * On "All", news/equipment coverage is confined to the last grid row so rank alone cannot
 * bury evidence under trade coverage.
 */
export const NEWS_ROW_SIZE = 2;
export const NEWS_ROW_TYPES: ArticleType[] = ["industry", "ce", "product"];

export type HomeFeedFilter = ArticleType | "all";

export const TYPE_TABS: { id: HomeFeedFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "research", label: "Research" },
  { id: "guideline", label: "Guidelines" },
  { id: "industry", label: "Industry & Policy" },
  { id: "ce", label: "CE & Events" },
  { id: "product", label: "Equipment" },
];

export function topicDisplayLabelFor(
  articles: DecoratedArticle[],
  topicParam: string | null,
): string | null {
  if (!topicParam) return null;
  for (const a of articles) {
    const match = [...a.tags, a.specialtyLabel].find((t) => slugifyTopic(t) === topicParam);
    if (match) return match;
  }
  return topicParam
    .split("-")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function filterHomeArticles(
  articles: DecoratedArticle[],
  filter: HomeFeedFilter,
  topicParam: string | null,
): DecoratedArticle[] {
  const byType = filter === "all" ? articles : articles.filter((a) => a.type === filter);
  if (!topicParam) return byType;
  return byType.filter(
    (a) => a.tags.some((t) => slugifyTopic(t) === topicParam) || slugifyTopic(a.specialtyLabel) === topicParam,
  );
}

export interface HomeFeedSelection {
  filtered: DecoratedArticle[];
  heroPool: DecoratedArticle[];
  gridArticles: DecoratedArticle[];
}

/**
 * Picks the hero rotation pool and grid cards for one Home tab. Pure — safe on the server
 * for first paint and on the client when switching tabs after hydration.
 */
export function selectHomeFeed({
  articles,
  filter,
  topicParam,
  gridSeenFingerprints,
}: {
  articles: DecoratedArticle[];
  filter: HomeFeedFilter;
  topicParam: string | null;
  gridSeenFingerprints: string[];
}): HomeFeedSelection {
  const filtered = filterHomeArticles(articles, filter, topicParam);
  const withImage = filtered.filter((a) => a.image);

  const seenHeroImages = new Set<string>();
  const heroPool: DecoratedArticle[] = [];
  for (const a of withImage) {
    if (!HERO_ELIGIBLE_TYPES.includes(a.type)) continue;
    if (!a.image || seenHeroImages.has(a.image)) continue;
    seenHeroImages.add(a.image);
    heroPool.push(a);
    if (heroPool.length >= HERO_SIZE) break;
  }

  const gridTarget = filter === "research" ? RESEARCH_GRID_SIZE : heroPool.length > 0 ? GRID_SIZE : MIN_HOME_CARDS;
  const heroIds = new Set(heroPool.map((a) => a.id));
  const heroImages = new Set(heroPool.map((a) => a.image).filter((img): img is string => !!img));
  const orderedForGrid = orderArticlesForGrid(withImage, gridSeenFingerprints);

  const seenImages = new Set<string>(heroImages);
  const take = (limit: number, allowedTypes: ArticleType[] | null) => {
    const picked: DecoratedArticle[] = [];
    for (const a of orderedForGrid) {
      if (picked.length >= limit) break;
      if (heroIds.has(a.id)) continue;
      if (allowedTypes && !allowedTypes.includes(a.type)) continue;
      if (!a.image || seenImages.has(a.image)) continue;
      seenImages.add(a.image);
      picked.push(a);
    }
    return picked;
  };

  const gridArticles =
    filter !== "all" ? take(gridTarget, null) : [...take(gridTarget - NEWS_ROW_SIZE, MEDICAL_TYPES), ...take(NEWS_ROW_SIZE, NEWS_ROW_TYPES)];

  return { filtered, heroPool, gridArticles };
}
