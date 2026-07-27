import "server-only";
import { parse, type HTMLElement } from "node-html-parser";
import type { Article } from "@/lib/types";
import { classify } from "@/lib/news-live";

/**
 * Live scrape of https://www.apta.org/news for the APTA News section.
 *
 * Two real constraints shaped this file:
 *
 * 1. apta.org's markup could not be inspected while building this — the sandbox this was
 *    built in blocks the domain outright (its own egress policy, confirmed via a direct
 *    403 with `x-deny-reason: host_not_allowed`), and a WebFetch attempt got a *different*
 *    403 straight from apta.org's own server, which usually means bot/WAF protection on
 *    their end rather than a network-policy block. That's a real signal this scrape may
 *    not work even once deployed somewhere with normal egress — unlike Google News RSS or
 *    PubMed's E-utilities, apta.org's website isn't designed for programmatic consumption.
 * 2. Because of (1), the selectors below are deliberately URL-pattern-based rather than
 *    tied to specific CSS classes/IDs — a page redesign that keeps `/news/YYYY/MM/DD/...`
 *    URLs (an extremely common CMS convention) won't break this, whereas guessing at div
 *    classes I've never seen would be pure luck.
 *
 * Falls back to APTA_NEWS_SEED (lib/apta-news-static.ts) if this returns too few results —
 * same graceful-degradation pattern as every other live source in this app.
 */

const NEWS_URL = "https://www.apta.org/news";
const FETCH_TIMEOUT_MS = 8000;
const DATED_PATH = /\/news\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//;
const MIN_TITLE_LENGTH = 20;

function stableId(href: string): string {
  let hash = 0;
  for (let i = 0; i < href.length; i++) hash = (hash * 31 + href.charCodeAt(i)) >>> 0;
  return "apta-" + hash.toString(36);
}

function dateFromHref(href: string): string | null {
  const m = DATED_PATH.exec(href);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function nearbySnippet(anchor: HTMLElement, title: string): string {
  // Walk up a few ancestors looking for a "card" container, then take whatever text is
  // left after removing the title itself — a best-effort dek/summary, not guaranteed.
  let node: HTMLElement | null = anchor;
  for (let i = 0; i < 3 && node; i++) {
    const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const withoutTitle = text.replace(title, "").trim();
    if (withoutTitle.length > 40) return withoutTitle.slice(0, 220);
    node = node.parentNode as HTMLElement | null;
  }
  return "";
}

function estimateReadMins(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200) || 2);
}

export async function fetchAptaNews(limit = 12): Promise<Article[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let html: string;
  try {
    const res = await fetch(NEWS_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LimbicPTNews/1.0)" },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    html = await res.text();
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }

  try {
    const root = parse(html);
    const anchors = root.querySelectorAll("a");
    const seen = new Set<string>();
    const articles: Article[] = [];

    for (const a of anchors) {
      if (articles.length >= limit) break;
      const href = a.getAttribute("href");
      if (!href || !href.includes("/news/")) continue;
      const title = (a.textContent || "").replace(/\s+/g, " ").trim();
      if (title.length < MIN_TITLE_LENGTH) continue;

      const absoluteUrl = href.startsWith("http") ? href : new URL(href, NEWS_URL).toString();
      if (seen.has(absoluteUrl)) continue;
      seen.add(absoluteUrl);

      const date = dateFromHref(href) ?? new Date().toISOString().slice(0, 10);
      const snippet = nearbySnippet(a, title);
      const summary = snippet || "Read the full story at APTA.org.";
      const { specialty } = classify(title, "industry");

      articles.push({
        id: stableId(absoluteUrl),
        type: "industry",
        specialty,
        title,
        source: "APTA",
        sourceUrl: absoluteUrl,
        date,
        readMins: estimateReadMins(summary),
        summary,
        tags: ["APTA News"],
        live: true,
      });
    }

    return articles;
  } catch {
    return [];
  }
}
