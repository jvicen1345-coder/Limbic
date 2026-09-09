import { NextRequest, NextResponse } from "next/server";
import { fetchAptaNews } from "@/lib/apta-news";
import { fetchLiveArticles } from "@/lib/news-live";
import { fetchPubmedResearch } from "@/lib/pubmed";

/**
 * Warms the tagged live-news / APTA / PubMed aggregations so a reader's first News, Home,
 * badge, or article request is more likely to hit cache instead of a cold Google News
 * or E-utilities round trip. Runs daily — see the "crons" entry in vercel.json — same
 * "scheduled job, no signed-in user" auth pattern as
 * app/api/cron/refresh-unpaywall-cache/route.ts.
 *
 * Does not scrape publisher og:images (that's the Home TTFB image-path issue, not this
 * cache layer).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [live, pubmed, apta] = await Promise.all([fetchLiveArticles(), fetchPubmedResearch(), fetchAptaNews()]);
  return NextResponse.json({
    ok: true,
    liveCount: live.length,
    pubmedCount: pubmed.length,
    aptaCount: apta.length,
  });
}
