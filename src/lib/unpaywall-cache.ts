import "server-only";
import { prisma } from "@/lib/db";
import { checkUnpaywall } from "@/lib/unpaywall";
import type { UnpaywallResult } from "@/lib/unpaywall-shared";
import type { UnpaywallCache } from "@/generated/prisma/client";

/** Open-access status changes rarely once a paper is published, so this is a generous
 *  window compared to checkUnpaywall's own 24h HTTP-level cache — the daily cron sweep
 *  (app/api/cron/refresh-unpaywall-cache/route.ts) keeps entries far fresher than this in
 *  practice; this just bounds how stale a DOI the cron hasn't swept in a while is allowed
 *  to get before a reader's own request pays for a live refresh. */
const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

function rowToResult(row: UnpaywallCache): UnpaywallResult {
  return {
    doi: row.doi,
    isOpenAccess: row.isOpenAccess,
    oaStatus: row.oaStatus as UnpaywallResult["oaStatus"],
    bestOaLocation: row.bestOaLocation ? JSON.parse(row.bestOaLocation) : null,
    title: row.title,
    journal: row.journal,
  };
}

async function writeThrough(doi: string, result: UnpaywallResult): Promise<void> {
  const data = {
    isOpenAccess: result.isOpenAccess,
    oaStatus: result.oaStatus,
    bestOaLocation: result.bestOaLocation ? JSON.stringify(result.bestOaLocation) : null,
    title: result.title,
    journal: result.journal,
    checkedAt: new Date(),
  };
  await prisma.unpaywallCache.upsert({ where: { doi }, create: { doi, ...data }, update: data });
}

/** The cache-first replacement for calling lib/unpaywall.ts's checkUnpaywall directly —
 *  every reader of open-access status (lib/article-view.ts's buildArticleView,
 *  app/actions/article.ts's checkArticleOpenAccessAction) goes through this now. A fresh
 *  cache row is an instant DB read with no dependency on Unpaywall being reachable; a
 *  missing or stale row falls back to a live lookup (writing the result back for next
 *  time), so a DOI the daily cron hasn't swept yet — a brand-new article, or an old one
 *  reached via a direct link — still resolves correctly, just without the cache's
 *  speed/resilience benefit that one time. Never throws, same as checkUnpaywall itself. */
export async function getCachedUnpaywall(doi: string): Promise<UnpaywallResult | null> {
  const row = await prisma.unpaywallCache.findUnique({ where: { doi } });
  if (row && Date.now() - row.checkedAt.getTime() < STALE_AFTER_MS) {
    return rowToResult(row);
  }

  const fresh = await checkUnpaywall(doi);
  if (fresh) await writeThrough(doi, fresh);
  return fresh;
}

/** Warms the cache for a batch of DOIs — used by the daily cron sweep
 *  (app/api/cron/refresh-unpaywall-cache/route.ts) over the current live PubMed research
 *  pool. Already-fresh entries cost nothing beyond one DB read each (getCachedUnpaywall
 *  skips the live call), so re-sweeping the same DOI day after day is cheap. */
export async function refreshUnpaywallCacheForDois(dois: string[]): Promise<{ checked: number; resolved: number }> {
  const unique = Array.from(new Set(dois));
  let resolved = 0;
  await Promise.all(
    unique.map(async (doi) => {
      const result = await getCachedUnpaywall(doi);
      if (result) resolved++;
    })
  );
  return { checked: unique.length, resolved };
}
