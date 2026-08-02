"use server";

import { revalidatePath } from "next/cache";

/** Bypasses the live wellness-article fetch's cache window so the next load of /wellness
 *  pulls a fresh batch instead of waiting out the revalidation window — see
 *  lib/news-live.ts fetchLiveWellness. The video list is a fixed curated set (not
 *  live-sourced), so refreshing re-fetches what actually can change: the article reading. */
export async function refreshWellnessAction() {
  revalidatePath("/wellness");
}
