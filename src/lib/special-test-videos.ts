import "server-only";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface SpecialTestVideo {
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

// Shared across every reader (not per-user) since the same handful of named tests get
// expanded repeatedly — one real API call per test name, ever, per CACHE_TTL_MS window.
const cache = new Map<string, { at: number; video: SpecialTestVideo | null }>();

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 21600 } });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[special-test-videos] YouTube request failed (${res.status}): ${body.slice(0, 300)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[special-test-videos] YouTube request threw:", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Finds a real demonstration video for one special test via the YouTube Data API v3, on
 *  demand — called from getSpecialTestVideoAction (app/actions/special-tests.ts) only once a
 *  reader actually asks to see a given test's video, not prefetched for the whole 50-test
 *  library. Same "live search, never a hardcoded/unverified video id" approach as
 *  lib/clips-live.ts: fabricating a specific video URL for a clinical technique risks
 *  linking to something that doesn't actually show the test, or shows it incorrectly, so
 *  this always searches for and verifies a real, currently-embeddable result instead. Same
 *  embeddability double-check as clips-live.ts's fetchEmbeddableBatch, for the same reason
 *  (search.list says nothing about whether a result actually plays once embedded). Returns
 *  null (never throws) when YOUTUBE_API_KEY isn't set or no embeddable result is found, same
 *  graceful-degradation pattern as fetchLiveClips. */
export async function findSpecialTestVideo(testName: string, region: string): Promise<SpecialTestVideo | null> {
  if (!YOUTUBE_API_KEY) return null;

  const cached = cache.get(testName);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.video;

  const query = `${testName} special test ${region} physical therapy demonstration`;
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    safeSearch: "strict",
    relevanceLanguage: "en",
    maxResults: "5",
    key: YOUTUBE_API_KEY,
  });
  const searchJson = await fetchJson<{ items?: YouTubeSearchItem[] }>(`https://www.googleapis.com/youtube/v3/search?${searchParams}`);
  const items = searchJson?.items ?? [];
  const candidates = items
    .map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title?.trim(),
      channelTitle: item.snippet?.channelTitle?.trim() || "YouTube",
    }))
    .filter((c): c is SpecialTestVideo => !!c.videoId && !!c.title);

  if (candidates.length === 0) {
    cache.set(testName, { at: Date.now(), video: null });
    return null;
  }

  const statusParams = new URLSearchParams({
    part: "status",
    id: candidates.map((c) => c.videoId).join(","),
    key: YOUTUBE_API_KEY,
  });
  const statusJson = await fetchJson<{ items?: YouTubeVideoStatusItem[] }>(`https://www.googleapis.com/youtube/v3/videos?${statusParams}`);
  const embeddable = new Set(
    (statusJson?.items ?? [])
      .filter((item) => item.id && item.status?.embeddable && item.status.privacyStatus === "public")
      .map((item) => item.id!)
  );

  const best = candidates.find((c) => embeddable.has(c.videoId)) ?? null;
  cache.set(testName, { at: Date.now(), video: best });
  return best;
}
