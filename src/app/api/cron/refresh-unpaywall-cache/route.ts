import { NextRequest, NextResponse } from "next/server";
import { fetchPubmedResearch } from "@/lib/pubmed";
import { refreshUnpaywallCacheForDois } from "@/lib/unpaywall-cache";

/**
 * Warms lib/unpaywall-cache.ts's UnpaywallCache table for every doi in the current live
 * PubMed research pool (see lib/pubmed.ts's fetchPubmedResearch — the same fetch the Home
 * feed's Research tab and the article detail page ultimately draw from), so a reader's own
 * request almost always hits the cache rather than a live Unpaywall call. Runs daily — see
 * the "crons" entry in vercel.json — same "scheduled job, no signed-in user" auth pattern
 * as app/api/cron/migration-reminders/route.ts.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await fetchPubmedResearch();
  const dois = articles.map((a) => a.doi).filter((doi): doi is string => !!doi);
  const result = await refreshUnpaywallCacheForDois(dois);
  return NextResponse.json({ ok: true, ...result });
}
