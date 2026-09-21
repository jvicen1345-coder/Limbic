import type { Article, ArticleType, Specialty } from "@/lib/types";
import type { DecoratedArticle } from "@/lib/feed";

export const VALID_SEARCH_TYPES: ArticleType[] = ["research", "guideline", "industry", "ce", "product"];
export const VALID_SEARCH_SPECIALTIES: Specialty[] = ["ortho", "neuro", "cardiopulm", "sports", "pediatric", "geriatric"];

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

/**
 * Remount key for SearchScreen. Chips and "new today" stay URL-driven (no
 * prop-sync effects). `q` and `page` are omitted so the 300ms query debounce
 * and pagination do not remount the input mid-type.
 */
export function searchScreenRemountKey(input: {
  type?: SearchTypeFilter;
  specialty?: SearchSpecialtyFilter;
  newOnly?: boolean;
}): string {
  return searchArticlesHref({
    type: input.type,
    specialty: input.specialty,
    newOnly: input.newOnly,
  });
}

/** A DOI reduced to the bare identifier: a doi.org URL and a "doi:" prefix both strip, and
 *  case folds. PubMed hands us a bare `10.1234/x`, but a reader pastes whatever the
 *  publisher's page gave them, which is almost always the doi.org link. */
export function normalizeDoi(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "");
}

/** Shaped like a DOI: the `10.` registrant prefix and a slash. Used to decide whether a
 *  partial query may match a DOI by its leading characters — without it, typing "10" would
 *  match every PubMed article in the pool. */
const DOI_LIKE = /^10\.\d{4,9}\//;

function matchesDoi(doi: string | undefined, rawQuery: string): boolean {
  if (!doi) return false;
  const target = normalizeDoi(doi);
  const typed = normalizeDoi(rawQuery);
  if (!typed) return false;
  return target === typed || (DOI_LIKE.test(typed) && target.startsWith(typed));
}

/** Lowercased, with runs of whitespace collapsed — so a title pasted out of a PDF, where
 *  a line break has become a double space, still equals the one we hold. */
function fold(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

type SearchableArticle = Pick<Article, "type" | "specialty" | "date" | "title" | "summary" | "tags" | "source"> &
  Partial<Pick<Article, "doi">>;

/**
 * How well an article answers the query, lower first. Sorting search purely by date meant
 * an article the reader had named outright — by pasting its DOI, or typing its title —
 * ranked below anything newer that happened to mention those words in its summary. The
 * reader who knows what they are looking for is the one the old order served worst.
 *
 * Every article scores NO_QUERY on an empty query, so a bare `/search` stays newest-first.
 */
export const SEARCH_RANK = {
  DOI: 0,
  EXACT_TITLE: 1,
  TITLE_PREFIX: 2,
  TITLE_CONTAINS: 3,
  SOURCE_OR_TAG: 4,
  SUMMARY: 5,
  NO_QUERY: 6,
} as const;

export function searchRelevance(article: SearchableArticle, rawQuery: string): number {
  const q = fold(rawQuery);
  if (!q) return SEARCH_RANK.NO_QUERY;
  if (matchesDoi(article.doi, rawQuery)) return SEARCH_RANK.DOI;
  const title = fold(article.title);
  if (title === q) return SEARCH_RANK.EXACT_TITLE;
  if (title.startsWith(q)) return SEARCH_RANK.TITLE_PREFIX;
  if (title.includes(q)) return SEARCH_RANK.TITLE_CONTAINS;
  if (article.source.toLowerCase().includes(q)) return SEARCH_RANK.SOURCE_OR_TAG;
  if (article.tags.some((t) => t.toLowerCase().includes(q))) return SEARCH_RANK.SOURCE_OR_TAG;
  if (article.summary.toLowerCase().includes(q)) return SEARCH_RANK.SUMMARY;
  return Number.POSITIVE_INFINITY;
}

export function articleMatchesSearch(
  article: SearchableArticle,
  query: Pick<SearchQuery, "type" | "specialty" | "q" | "newOnly">,
  todayStr: string
): boolean {
  if (query.type !== "all" && article.type !== query.type) return false;
  if (query.specialty !== "all" && article.specialty !== query.specialty) return false;
  if (query.newOnly && article.date !== todayStr) return false;
  return Number.isFinite(searchRelevance(article, query.q));
}

export function filterSearchArticles<T extends SearchableArticle>(
  articles: T[],
  query: Pick<SearchQuery, "type" | "specialty" | "q" | "newOnly">,
  todayStr: string
): T[] {
  return articles
    .filter((article) => articleMatchesSearch(article, query, todayStr))
    .slice()
    .sort((a, b) => {
      const byRelevance = searchRelevance(a, query.q) - searchRelevance(b, query.q);
      if (byRelevance !== 0) return byRelevance;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
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
