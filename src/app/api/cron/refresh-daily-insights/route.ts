import { NextRequest, NextResponse } from "next/server";
import { refreshDailyInsights } from "@/lib/daily-insight-agent";
import { todayLocalDateStr } from "@/lib/today";

/**
 * Writes today's Home insight for readers who don't have one yet (see lib/daily-insight.ts)
 * — the "crons" entry in vercel.json hits this daily. This is the only place the insight's
 * LLM call ever runs: never inline on a Home request, always this bounded batch, exactly as
 * app/api/cron/refresh-interest-profiles/route.ts does for interest profiles. A reader this
 * run doesn't reach still sees a real, sourced insight — the deterministic fallback — so
 * missing a run degrades the card's writing, never its truthfulness.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await refreshDailyInsights(todayLocalDateStr());
  return NextResponse.json({ ok: true, ...result });
}
