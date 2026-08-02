"use server";

import { revalidatePath, updateTag } from "next/cache";
import { invalidateLiveArticlesCache } from "@/lib/news-live";

/** Forces the Home main feed's next render to pull genuinely fresh live articles instead
 *  of whatever's sitting in cache (see lib/news-live.ts's in-memory cache, plus the
 *  fetch()-level revalidate windows in lib/news-live.ts and lib/pubmed.ts) — both layers
 *  need invalidating, since the in-memory one sits in front of the tagged fetches and
 *  would otherwise keep serving its own snapshot even after the tags are updated.
 *  updateTag (not revalidateTag) because this is a read-your-own-click action — the
 *  reader who clicked Refresh should see new articles on this very next request, not get
 *  stale-while-revalidate semantics where the fresh pull only lands for someone else's
 *  later visit. */
export async function refreshHomeFeedAction() {
  invalidateLiveArticlesCache();
  updateTag("live-news");
  updateTag("live-research");
  revalidatePath("/");
}
