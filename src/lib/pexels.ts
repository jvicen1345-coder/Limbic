import "server-only";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const FETCH_TIMEOUT_MS = 6000;

interface PexelsPhoto {
  src: { large: string };
}

async function searchPexels(query: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({ query, per_page: "1", orientation: "landscape" });
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
      return null;
    }
    const json = (await res.json()) as { photos?: PexelsPhoto[] };
    return json.photos?.[0]?.src?.large ?? null;
  } catch (err) {
    console.error(`[pexels] search threw for "${query}":`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const cache = new Map<string, { at: number; url: string | null }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * A real, freely-licensed stock photo matching `query` (see lib/topic-image.ts for how the
 * query is built from an article's specialty/title) — used as a fallback for articles that
 * don't have their own real og:image (see lib/og-image.ts attachRealImages), which in
 * practice is most seed/guideline-PDF content (a PDF has no og:image to find at all).
 *
 * Returns null (never throws) when PEXELS_API_KEY isn't set — those articles just render
 * without an image, same graceful-degradation pattern as YOUTUBE_API_KEY (see
 * lib/clips-live.ts). Cached in-process per query, on top of Next's own fetch cache above,
 * since many articles share a specialty/topic and would otherwise repeat the same search on
 * every request.
 */
export async function fetchTopicPhoto(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;
  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.url;

  const url = await searchPexels(query);
  cache.set(query, { at: Date.now(), url });
  return url;
}
