import "server-only";
import type { Article } from "@/lib/types";

/**
 * Fetches the real `og:image` an article's own page declares — the same image the
 * publisher uses for its own social-media previews — rather than attaching any
 * fabricated or generic stand-in. Used only for the small handful of articles shown in
 * the home page's revolving news card, not the whole feed, since it's one extra network
 * request per article.
 *
 * Only reads the first chunk of each page (bounded to look for `</head>`, where og:image
 * always lives) rather than downloading full article HTML, and fails silently — a
 * missing/blocked image just means that card renders without one, same as any article
 * without a sourceUrl at all.
 */

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 150_000;
const OG_IMAGE_RE =
  /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i;

// Google News RSS items' own "link" (see lib/news-live.ts itemToArticle) is a
// news.google.com click-tracking redirect, not the publisher's real URL — it resolves to
// the actual article via a client-side (JS) redirect, which a plain server-side fetch never
// executes. Fetching it just returns Google News' own interstitial page, whose og:image is
// Google's generic news-icon branding, not anything about the article — worse than no image
// at all, so these are skipped entirely rather than trusted.
function isUnresolvableRedirect(url: string): boolean {
  try {
    return new URL(url).hostname === "news.google.com";
  } catch {
    return false;
  }
}

// A handful of known "og:image" values are a *site's* generic social-preview branding,
// not anything specific to the article — PubMed uses the exact same image on every single
// article page regardless of PMID (verified directly against pubmed.ncbi.nlm.nih.gov).
// Accepting it as a real image tells the reader nothing about the actual article, and
// worse, blocks lib/topic-image.ts's per-article stock-photo fallback (which only fills
// in articles that don't already have `.image` set) — so a useless shared logo silently
// crowds out a real, distinguishing photo. Treated as "no image found" instead.
const GENERIC_SITE_IMAGES = new Set(["https://cdn.ncbi.nlm.nih.gov/pubmed/persistent/pubmed-meta-image-v2.jpg"]);

async function fetchOgImage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LimbicPTNews/1.0)" },
      // A publisher's og:image essentially never changes after an article is posted, so
      // there's no freshness reason to keep re-scraping every hour — widened from 1hr to
      // 24hr since this is the single biggest per-request cost on Home (up to ~16 of
      // these run in parallel per load) and a cache miss here is a real network round
      // trip to an arbitrary third-party server, not just a DB read.
      next: { revalidate: 86400 },
    });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let bytesRead = 0;
    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
    reader.cancel().catch(() => {});

    const match = OG_IMAGE_RE.exec(html);
    const raw = match?.[1] || match?.[2];
    if (!raw) return null;
    const resolved = new URL(raw, url).toString();
    return GENERIC_SITE_IMAGES.has(resolved) ? null : resolved;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Attaches a real `image` to each article that has a `sourceUrl` and a discoverable
 *  og:image, leaving the rest untouched. Never throws. */
export async function attachRealImages(articles: Article[]): Promise<Article[]> {
  return Promise.all(
    articles.map(async (a) => {
      if (!a.sourceUrl || isUnresolvableRedirect(a.sourceUrl)) return a;
      const image = await fetchOgImage(a.sourceUrl);
      return image ? { ...a, image } : a;
    })
  );
}
