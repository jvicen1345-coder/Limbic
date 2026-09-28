import { NextRequest, NextResponse } from "next/server";
import { EVIDENCE_TOPICS } from "@/lib/evidence-topics";
import { getAllTopicStudyIds } from "@/lib/evidence-topic-feed";
import { ensureBreakdown, getCachedBreakdowns } from "@/lib/article-breakdown-store";
import { isCurrentBreakdown } from "@/lib/article-breakdown-shared";

/**
 * Breaks down the studies listed on the public condition pages (app/evidence/topics/[slug])
 * ahead of time, so a visitor from Google sees a plain-language summary instead of "sign in
 * to generate one". The public pages themselves never call the model — that would let any
 * crawler spend model calls — so this scheduled job is the only way an unopened study gets
 * a public summary.
 *
 * Bounded per run (MAX_PER_RUN) so a fresh deploy with hundreds of uncached studies works
 * through them over a few days rather than in one long, expensive invocation. Same
 * CRON_SECRET auth as the other scheduled jobs (see app/api/cron/refresh-unpaywall-cache).
 */
export const maxDuration = 300;

const MAX_PER_RUN = 16;
const CONCURRENCY = 4;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ids = await getAllTopicStudyIds(EVIDENCE_TOPICS);
  const cached = await getCachedBreakdowns(ids);
  // Missing first, then pre-version-2 rows to upgrade.
  const todo = [
    ...ids.filter((id) => !cached.has(id)),
    ...ids.filter((id) => cached.has(id) && !isCurrentBreakdown(cached.get(id)!)),
  ].slice(0, MAX_PER_RUN);

  let generated = 0;
  let failed = 0;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((id) => ensureBreakdown(id, { upgrade: true }).catch(() => null)));
    for (const r of results) {
      if (r && isCurrentBreakdown(r)) generated++;
      else failed++;
    }
  }

  return NextResponse.json({ ok: true, studies: ids.length, attempted: todo.length, generated, failed });
}
