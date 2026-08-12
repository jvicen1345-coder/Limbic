import { NextRequest, NextResponse } from "next/server";
import { refreshStaleInterestProfiles } from "@/lib/llm-interest-profile";

/**
 * Runs refreshStaleInterestProfiles() (see lib/llm-interest-profile.ts) on a schedule — see
 * the "crons" entry in vercel.json, which hits this daily. This is the only place the LLM
 * interest-profile call ever runs: never inline on a Home request (see lib/llm-interest-
 * profile.ts's STALE_AFTER_HOURS comment for why), always this bounded, off-request-path
 * batch job instead — same "scheduled job, no signed-in user" auth pattern as
 * app/api/cron/migration-reminders/route.ts.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await refreshStaleInterestProfiles();
  return NextResponse.json({ ok: true, ...result });
}
