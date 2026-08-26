import "server-only";
import { getArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import type { Article, Specialty } from "@/lib/types";

const RESULT_COUNT = 4;

/** Maps a ClinicalPatient.specialty / clinician profile specialty label — see
 *  CLINICIAN_SPECIALTIES in lib/clinician-dashboard-types.ts, the Add Patient form's
 *  "Specialty" dropdown — to the article feed's own narrower Specialty union (lib/types.ts).
 *  "Cardiopulmonary" has no equivalent bucket in the article feed today, so it maps to
 *  null and falls through to the "nothing matches" most-recent-articles path below, same
 *  as any other specialty string the feed doesn't recognize. */
const SPECIALTY_TO_ARTICLE_SPECIALTY: Record<string, Specialty> = {
  musculoskeletal: "ortho",
  orthopedic: "ortho",
  neurological: "neuro",
  neurologic: "neuro",
  pediatrics: "pediatric",
  pediatric: "pediatric",
  geriatrics: "geriatric",
  geriatric: "geriatric",
  sports: "sports",
  // The no-patient-selected default mode (see app/pro/dashboard/page.tsx) passes the
  // clinician's own User.specialty, which is already stored as one of these article
  // Specialty slugs (see its schema.prisma default "ortho") rather than a
  // CLINICIAN_SPECIALTIES label like the other keys above — pediatric/geriatric/sports
  // are already identity-mapped from the clinician-label entries above, so only ortho and
  // neuro (whose clinician labels are spelled differently) need their own entry here.
  ortho: "ortho",
  neuro: "neuro",
};

function mostRecentFirst(articles: Article[]): Article[] {
  return articles.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Loose keyword match against an article's tags — same "free-text clinical phrase vs. a
 *  fixed tag vocabulary" gap dashboard-research bridges everywhere: bodyRegion/condition
 *  are whatever a clinician typed on the Add Patient form (lib/clinician-dashboard-types.ts
 *  BODY_REGIONS is a fixed list, but condition is free text — e.g. "Post-op ACL
 *  reconstruction"), while an article's tags are its own short keyword set. Matches on
 *  whole words shared between the query and any tag, in either direction, rather than
 *  requiring an exact tag match a clinician's free-text condition would rarely produce. */
function matchesKeywords(article: Article, query: string): boolean {
  const queryWords = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
  if (queryWords.length === 0) return false;
  const tagText = article.tags.join(" ").toLowerCase();
  return queryWords.some((w) => tagText.includes(w)) || queryWords.some((w) => article.title.toLowerCase().includes(w));
}

/** The Clinician Dashboard's Live Research Feed (right column — see
 *  app/pro/dashboard/page.tsx) — reads from the same merged article pool every other feed
 *  in this app uses (lib/articles.ts getArticles), never a separate query or new article
 *  record. Three tiers, most specific first:
 *  1. bodyRegion + condition both given (an active patient is selected) — keyword match
 *     against tags/title, up to 4 results.
 *  2. Only specialty given (no patient selected — the clinician's own specialty
 *     preference) — exact Specialty match, up to 4 results.
 *  3. Neither tier found anything — the 4 most recent articles in the feed, so the panel
 *     is never empty. */
export async function getResearchFeedArticles(
  specialty: string,
  bodyRegion?: string,
  condition?: string
): Promise<Article[]> {
  const articles = await getArticles();

  if (bodyRegion && condition) {
    const query = `${bodyRegion} ${condition}`;
    const matched = mostRecentFirst(articles.filter((a) => matchesKeywords(a, query))).slice(0, RESULT_COUNT);
    if (matched.length > 0) return matched;
  }

  const mappedSpecialty = SPECIALTY_TO_ARTICLE_SPECIALTY[specialty.toLowerCase().trim()];
  if (mappedSpecialty) {
    const matched = mostRecentFirst(articles.filter((a) => a.specialty === mappedSpecialty)).slice(0, RESULT_COUNT);
    if (matched.length > 0) return matched;
  }

  return mostRecentFirst(articles).slice(0, RESULT_COUNT);
}

const DIGEST_COUNT = 3;
const DIGEST_WINDOW_DAYS = 7;

export interface WeeklyResearchDigest {
  specialtyLabel: string;
  articles: Article[];
  rangeStart: string; // ISO yyyy-mm-dd
  rangeEnd: string;
}

/** The right column's default-mode (no patient selected) "This Week in [Specialty]" card —
 *  see components/pro/dashboard/ResearchFeedPanel.tsx. Prefers articles published in the
 *  last 7 days matching the clinician's specialty, backfilling with the next most recent
 *  specialty-matched articles (regardless of date) if fewer than 3 fall in that window —
 *  same "never show an empty panel" reasoning as getResearchFeedArticles' own tiers above.
 *  Only returns fewer than 3 if the specialty-matched pool itself has fewer than 3 articles
 *  total, in which case the panel shows a "more research coming this week" placeholder for
 *  the remaining slots. */
export async function getWeeklyResearchDigest(specialty: string): Promise<WeeklyResearchDigest> {
  const articles = await getArticles();
  const mappedSpecialty = SPECIALTY_TO_ARTICLE_SPECIALTY[specialty.toLowerCase().trim()];
  const specialtyLabel = mappedSpecialty ? SPECIALTY_META[mappedSpecialty] : "Your Specialty";

  const pool = mappedSpecialty ? articles.filter((a) => a.specialty === mappedSpecialty) : articles;
  const sortedPool = mostRecentFirst(pool);

  const now = new Date();
  const windowStart = new Date(now.getTime() - DIGEST_WINDOW_DAYS * 86400000);
  const withinWindow = sortedPool.filter((a) => new Date(a.date).getTime() >= windowStart.getTime());
  const backfill = sortedPool.filter((a) => !withinWindow.includes(a));

  const selected = [...withinWindow, ...backfill].slice(0, DIGEST_COUNT);

  const isoDate = (d: Date) => d.toISOString().slice(0, 10);
  return { specialtyLabel, articles: selected, rangeStart: isoDate(windowStart), rangeEnd: isoDate(now) };
}
