import "server-only";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface EducationVideo {
  videoId: string;
  title: string;
  channelTitle: string;
}

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string; channelTitle?: string };
}

interface YouTubeVideoStatusItem {
  id?: string;
  status?: { embeddable?: boolean; privacyStatus?: string };
}

// Shared across every reader (not per-user) and across every caller of findEmbeddableVideo
// below (Special Tests, Common Pathologies, ...) since the same handful of named
// topics/queries get expanded repeatedly — one real API call per cacheKey, ever, per
// CACHE_TTL_MS window. Keyed by the caller-supplied cacheKey rather than the query string so
// two different features never collide even if their queries happened to match.
const cache = new Map<string, { at: number; video: EducationVideo | null }>();

async function fetchJson<T>(url: string, logPrefix: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 21600 } });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[${logPrefix}] YouTube request failed (${res.status}): ${body.slice(0, 300)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[${logPrefix}] YouTube request threw:`, err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Finds a real, currently-embeddable video for one topic via the YouTube Data API v3, on
 *  demand. Shared by every "attach a real demonstration/explanation video" feature in this
 *  app (Special Tests Library, Health & Wellness Common Pathologies, ...) — same "live
 *  search, never a hardcoded/unverified video id" approach as lib/clips-live.ts:
 *  fabricating a specific video URL for clinical/health content risks linking to something
 *  that doesn't actually show what it claims, or is wrong/misleading, so this always
 *  searches for and verifies a real, currently-embeddable result instead. Same embeddability
 *  double-check as clips-live.ts's fetchEmbeddableBatch (search.list says nothing about
 *  whether a result actually plays once embedded). Returns null (never throws) when
 *  YOUTUBE_API_KEY isn't set or no embeddable result is found, same graceful-degradation
 *  pattern as fetchLiveClips.
 *
 *  cacheKey should uniquely identify the topic within its calling feature (e.g. a test name,
 *  a pathology slug) — it's what dedupes repeated lookups, not the query text itself. */
export async function findEmbeddableVideo(cacheKey: string, query: string, logPrefix: string): Promise<EducationVideo | null> {
  if (!YOUTUBE_API_KEY) return null;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.video;

  const searchParams = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    safeSearch: "strict",
    relevanceLanguage: "en",
    maxResults: "5",
    key: YOUTUBE_API_KEY,
  });
  const searchJson = await fetchJson<{ items?: YouTubeSearchItem[] }>(
    `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
    logPrefix
  );
  const items = searchJson?.items ?? [];
  const candidates = items
    .map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title?.trim(),
      channelTitle: item.snippet?.channelTitle?.trim() || "YouTube",
    }))
    .filter((c): c is EducationVideo => !!c.videoId && !!c.title);

  if (candidates.length === 0) {
    cache.set(cacheKey, { at: Date.now(), video: null });
    return null;
  }

  const statusParams = new URLSearchParams({
    part: "status",
    id: candidates.map((c) => c.videoId).join(","),
    key: YOUTUBE_API_KEY,
  });
  const statusJson = await fetchJson<{ items?: YouTubeVideoStatusItem[] }>(
    `https://www.googleapis.com/youtube/v3/videos?${statusParams}`,
    logPrefix
  );
  const embeddable = new Set(
    (statusJson?.items ?? [])
      .filter((item) => item.id && item.status?.embeddable && item.status.privacyStatus === "public")
      .map((item) => item.id!)
  );

  const best = candidates.find((c) => embeddable.has(c.videoId)) ?? null;
  cache.set(cacheKey, { at: Date.now(), video: best });
  return best;
}
