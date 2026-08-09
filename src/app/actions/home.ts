"use server";

import { revalidatePath, updateTag } from "next/cache";
import { invalidateLiveArticlesCache } from "@/lib/news-live";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { withSeenId } from "@/lib/seen-tracking";
import { MAX_HOME_GRID_SEEN_HISTORY } from "@/lib/home-grid-rotation";

/** Forces the Home main feed's next render to pull genuinely fresh live articles instead
 *  of whatever's sitting in cache (see lib/news-live.ts's in-memory cache, plus the
 *  fetch()-level revalidate windows in lib/news-live.ts and lib/pubmed.ts) — both layers
 *  need invalidating, since the in-memory one sits in front of the tagged fetches and
 *  would otherwise keep serving its own snapshot even after the tags are updated.
 *  updateTag (not revalidateTag) because this is a read-your-own-click action — the
 *  reader who clicked Refresh should see new articles on this very next request, not get
 *  stale-while-revalidate semantics where the fresh pull only lands for someone else's
 *  later visit.
 *
 *  `currentGridFingerprints` are title fingerprints (see lib/home-grid-rotation.ts
 *  titleFingerprint) of whatever the grid was showing right before this click — recorded
 *  as seen so the next render's grid selection prefers different articles instead of a
 *  live-source pool that hasn't actually changed yet (news/RSS sources don't update every
 *  few seconds) just landing back on the same deterministic top-N by rank. Fingerprints
 *  rather than article ids because live-sourced article ids aren't stable across fetches
 *  for the same story — see titleFingerprint's doc comment. */
export async function refreshHomeFeedAction(currentGridFingerprints: string[]) {
  const user = await getCurrentUser();
  if (user) {
    const existing = (user.homeGridSeenFingerprints as string[] | null) ?? [];
    let nextSeen = existing;
    for (const fp of currentGridFingerprints) nextSeen = withSeenId(nextSeen, fp, MAX_HOME_GRID_SEEN_HISTORY);
    if (nextSeen !== existing) {
      await prisma.user.update({ where: { id: user.id }, data: { homeGridSeenFingerprints: nextSeen } });
    }
  }

  invalidateLiveArticlesCache();
  updateTag("live-news");
  updateTag("live-research");
  revalidatePath("/");
}
