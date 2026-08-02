import "server-only";
import { classify } from "@/lib/news-live";
import type { Clip } from "@/lib/types";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const FETCH_TIMEOUT_MS = 8000;

// One query per specialty, so the live pool doesn't skew toward whichever topic YouTube's
// relevance ranking happens to favor for a single broad search — same reasoning as
// news-live.ts's multi-query approach for wellness articles.
const CLIP_QUERIES = [
  "physical therapy exercise tips",
  "sports physical therapy ACL rehab",
  "neuro rehab stroke physical therapy",
  "pediatric physical therapy occupational therapy",
  "geriatric balance fall prevention physical therapy exercise",
];

// A search scoped to these queries mostly returns on-topic results already, but this is a
// last-resort relevance gate against anything that slipped through — same spirit as
// news-live.ts's typeConfident check for Google News results, so a generic fitness or
// medical video without any clear PT/rehab framing doesn't end up on the Clips feed under
// a clinical label.
const RELEVANCE_KEYWORDS = [
  "physical therapy",
  "physiotherapy",
  "occupational therapy",
  "rehab",
  "rehabilitation",
  " pt ",
  " dpt",
  " otr",
];

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string; channelTitle?: string; description?: string };
}

async function searchYouTube(query: string): Promise<YouTubeSearchItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      videoDuration: "short", // YouTube's own "under 4 minutes" filter — Shorts and short clips.
      safeSearch: "strict",
      relevanceLanguage: "en",
      maxResults: "12",
      key: YOUTUBE_API_KEY!,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      signal: controller.signal,
      // Search results don't need to be second-fresh — see fetchLiveClips's own cache,
      // which is the real rate limiter (YouTube's free quota is small).
      next: { revalidate: 21600 },
    });
    if (!res.ok) {
      // Logged (not swallowed) since a non-2xx here is otherwise invisible — the caller
      // just sees an empty pool and no way to tell "API not enabled" from "quota
      // exhausted" from "key restricted to referrers that a server request never sends".
      const body = await res.text().catch(() => "");
      console.error(`[clips-live] YouTube search failed (${res.status}) for "${query}": ${body.slice(0, 500)}`);
      return [];
    }
    const json = (await res.json()) as { items?: YouTubeSearchItem[] };
    return json.items ?? [];
  } catch (err) {
    console.error(`[clips-live] YouTube search threw for "${query}":`, err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

let cache: { at: number; clips: Clip[] } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Live-sourced clips via the YouTube Data API v3, merged into the curated CLIPS pool by
 * lib/clips.ts getClips(). Returns [] (never throws) when YOUTUBE_API_KEY isn't set — the
 * app falls back entirely to the hand-curated static pool, same graceful-degradation
 * pattern as ai-pubmed-query.ts without ANTHROPIC_API_KEY.
 *
 * Cached in-process for CACHE_TTL_MS: the free YouTube Data API quota (10,000 units/day,
 * 100 per search.list call) is easily exhausted by a handful of queries per pool refresh,
 * and clips don't need to be minute-fresh — the per-user "seen" rotation (see
 * lib/clip-rotation.ts) is what keeps any individual visit feeling fresh, not how often
 * the underlying pool itself changes.
 */
export async function fetchLiveClips(): Promise<Clip[]> {
  if (!YOUTUBE_API_KEY) {
    console.error("[clips-live] YOUTUBE_API_KEY not set — Clips is using only the static pool.");
    return [];
  }
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.clips;

  const results = await Promise.all(CLIP_QUERIES.map((q) => searchYouTube(q)));
  const rawCount = results.reduce((n, items) => n + items.length, 0);

  const seen = new Set<string>();
  const clips: Clip[] = [];
  for (const items of results) {
    for (const item of items) {
      const videoId = item.id?.videoId;
      const title = item.snippet?.title?.trim();
      if (!videoId || !title) continue;
      if (seen.has(videoId)) continue;

      const description = item.snippet?.description ?? "";
      const haystack = ` ${title} ${description} `.toLowerCase();
      if (!RELEVANCE_KEYWORDS.some((kw) => haystack.includes(kw))) continue;

      seen.add(videoId);
      const { specialty } = classify(`${title} ${description}`, "research");
      clips.push({
        id: `yt-${videoId}`,
        title,
        source: item.snippet?.channelTitle?.trim() || "YouTube",
        specialty,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  // A one-line health check for the Vercel function logs: rawCount 0 across every query
  // means the API calls themselves are failing (see the per-query error above for why);
  // rawCount > 0 but clips.length 0 means results came back but none passed the relevance
  // filter, which would point at CLIP_QUERIES/RELEVANCE_KEYWORDS rather than the API call.
  console.log(`[clips-live] fetched ${rawCount} raw result(s) across ${CLIP_QUERIES.length} queries, ${clips.length} passed relevance filtering`);

  cache = { at: Date.now(), clips };
  return clips;
}
