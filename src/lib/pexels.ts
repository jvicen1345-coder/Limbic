import "server-only";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const FETCH_TIMEOUT_MS = 6000;
// Multiple candidates per query, not just the top result — many articles collapse onto the
// same query (e.g. every orthopedic article with no more specific title match all search
// "Orthopedic physical therapy rehabilitation"), and requesting just 1 result would mean
// every one of them shows the literal same photo. Picking from a pool per-article instead
// (see fetchTopicPhoto's seed param) spreads them out. 80 is Pexels' own per_page max — a
// generic specialty-only query (the highest-volume case, since it's shared by every article
// whose title doesn't match a more specific TOPIC_KEYWORDS term — see lib/topic-image.ts)
// can easily see several dozen articles in a week, and the previous pool of 15 made repeats
// within that same week likely; 80 pushes that back out to a size a week's worth of articles
// on one topic isn't likely to exhaust.
const CANDIDATES_PER_QUERY = 80;

interface PexelsPhoto {
  src: { large: string };
}

async function searchPexels(query: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({ query, per_page: String(CANDIDATES_PER_QUERY), orientation: "landscape" });
    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      signal: controller.signal,
      headers: { Authorization: PEXELS_API_KEY! },
      // Topic photos don't need to be fresh — a week-old "knee physical therapy" result is
      // exactly as good as a today's-fetch one, and this is the real rate limiter against
      // Pexels' free-tier quota (see the in-process cache below, which sits on top of this).
      next: { revalidate: 604800 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[pexels] search failed (${res.status}) for "${query}": ${body.slice(0, 500)}`);
      return [];
    }
    const json = (await res.json()) as { photos?: PexelsPhoto[] };
    return (json.photos ?? []).map((p) => p.src.large).filter(Boolean);
  } catch (err) {
    console.error(`[pexels] search threw for "${query}":`, err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Small, deterministic string hash (not cryptographic — just needs to spread article ids
 *  evenly across a candidate pool) so the same article always picks the same photo from its
 *  query's pool across requests/cache hits, without needing to persist a per-article choice
 *  anywhere. */
function hashToIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % length;
}

const cache = new Map<string, { at: number; urls: string[] }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function candidatesFor(query: string): Promise<string[]> {
  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.urls;

  const urls = await searchPexels(query);
  cache.set(query, { at: Date.now(), urls });
  return urls;
}

/**
 * A real, freely-licensed stock photo matching `query` (see lib/topic-image.ts for how the
 * query is built from an article's specialty/title) — used as a fallback for articles that
 * don't have their own real og:image (see lib/og-image.ts attachRealImages), which in
 * practice is most seed/guideline-PDF content (a PDF has no og:image to find at all) and
 * Google-News-sourced articles (whose sourceUrl is an unresolvable redirect, so it's never
 * trusted for an image either — see isUnresolvableRedirect in og-image.ts).
 *
 * `seed` (pass the article's own id) picks a stable photo out of the query's candidate pool
 * per article, rather than every article for the same query always showing the identical
 * top result. Returns null (never throws) when PEXELS_API_KEY isn't set — those articles
 * just render without an image, same graceful-degradation pattern as YOUTUBE_API_KEY (see
 * lib/clips-live.ts). The candidate pool itself is cached in-process per query, on top of
 * Next's own fetch cache above, since many articles share a specialty/topic and would
 * otherwise repeat the same search on every request.
 */
export async function fetchTopicPhoto(query: string, seed: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;
  const candidates = await candidatesFor(query);
  if (candidates.length === 0) return null;
  return candidates[hashToIndex(seed, candidates.length)];
}
