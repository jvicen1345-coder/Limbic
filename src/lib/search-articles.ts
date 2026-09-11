import type { Article, ArticleType, Specialty } from "@/lib/types";
import type { DecoratedArticle } from "@/lib/feed";

export const VALID_SEARCH_TYPES: ArticleType[] = ["research", "guideline", "industry", "ce", "product"];
export const VALID_SEARCH_SPECIALTIES: Specialty[] = ["ortho", "neuro", "sports", "pediatric", "geriatric"];

export type SearchTypeFilter = ArticleType | "all";
export type SearchSpecialtyFilter = Specialty | "all";

export type SearchQuery = {
  type: SearchTypeFilter;
  specialty: SearchSpecialtyFilter;
  q: string;
  newOnly: boolean;
  page: number;
};

/**
 * Card-sized Search DTO. Same display + Save-snapshot fields ArticleCard already reads,
 * without the feed-pool blobs (body paragraphs, full PubMed abstract, review notes) that
 * used to ride along in the RSC document when Search serialized every DecoratedArticle.
 */
export type SearchArticle = {
  id: string;
  type: ArticleType;
  specialty: Specialty;
  title: string;
  source: string;
  sourceUrl?: string;
  date: string;
  readMins: number;
  summary: string;
  tags: string[];
  image?: string;
  evidenceLevel?: Article["evidenceLevel"];
  doi?: string;
  typeLabel: string;
  typeTagClass: string;
  specialtyLabel: string;
  dateLabel: string;
  saved: boolean;
  isNew?: boolean;
  isRead?: boolean;
};

export function parseSearchType(raw: string | undefined): SearchTypeFilter {
  return VALID_SEARCH_TYPES.includes(raw as ArticleType) ? (raw as ArticleType) : "all";
}

export function parseSearchSpecialty(raw: string | undefined): SearchSpecialtyFilter {
  return VALID_SEARCH_SPECIALTIES.includes(raw as Specialty) ? (raw as Specialty) : "all";
}

export function parseSearchQuery(params: {
  type?: string;
  specialty?: string;
  q?: string;
  new?: string;
  page?: string;
}): SearchQuery {
  return {
    type: parseSearchType(params.type),
    specialty: parseSearchSpecialty(params.specialty),
    q: params.q ?? "",
    newOnly: params.new === "1",
    page: parseSearchPage(params.page),
  };
}

function parseSearchPage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/** Builds `/search?...` from the live filter state. Omits `all` / empty / page-1 values so
 *  deep links stay as short as the ones DailyDashboard and Threads already emit. */
export function searchArticlesHref(input: {
  type?: SearchTypeFilter;
  specialty?: SearchSpecialtyFilter;
  q?: string;
  newOnly?: boolean;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (input.type && input.type !== "all") params.set("type", input.type);
  if (input.specialty && input.specialty !== "all") params.set("specialty", input.specialty);
  const q = input.q?.trim() ?? "";
  if (q) params.set("q", q);
  if (input.newOnly) params.set("new", "1");
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export function articleMatchesSearch(
  article: Pick<Article, "type" | "specialty" | "date" | "title" | "summary" | "tags" | "source">,
  query: Pick<SearchQuery, "type" | "specialty" | "q" | "newOnly">,
  todayStr: string
): boolean {
  if (query.type !== "all" && article.type !== query.type) return false;
  if (query.specialty !== "all" && article.specialty !== query.specialty) return false;
  if (query.newOnly && article.date !== todayStr) return false;
  const q = query.q.trim().toLowerCase();
  if (!q) return true;
  return (
    article.title.toLowerCase().includes(q) ||
    article.summary.toLowerCase().includes(q) ||
    article.tags.some((t) => t.toLowerCase().includes(q)) ||
    article.source.toLowerCase().includes(q)
  );
}

export function filterSearchArticles<T extends Pick<Article, "type" | "specialty" | "date" | "title" | "summary" | "tags" | "source">>(
  articles: T[],
  query: Pick<SearchQuery, "type" | "specialty" | "q" | "newOnly">,
  todayStr: string
): T[] {
  return articles
    .filter((article) => articleMatchesSearch(article, query, todayStr))
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function toSearchArticle(article: DecoratedArticle): SearchArticle {
  return {
    id: article.id,
    type: article.type,
    specialty: article.specialty,
    title: article.title,
    source: article.source,
    ...(article.sourceUrl ? { sourceUrl: article.sourceUrl } : {}),
    date: article.date,
    readMins: article.readMins,
    summary: article.summary,
    tags: article.tags,
    ...(article.image ? { image: article.image } : {}),
    ...(article.evidenceLevel ? { evidenceLevel: article.evidenceLevel } : {}),
    ...(article.doi ? { doi: article.doi } : {}),
    typeLabel: article.typeLabel,
    typeTagClass: article.typeTagClass,
    specialtyLabel: article.specialtyLabel,
    dateLabel: article.dateLabel,
    saved: article.saved,
    isNew: article.isNew,
    isRead: article.isRead,
  };
}
