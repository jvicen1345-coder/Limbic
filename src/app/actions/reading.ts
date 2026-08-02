"use server";

import { getCurrentUser } from "@/lib/session";
import { updateReadingProgress } from "@/lib/reading";

/** Fired by components/ReadingProgressTracker.tsx while the reader scrolls an article.
 *  Deliberately doesn't revalidate any path — this is background telemetry for next time
 *  Home loads, not something that needs to update anything on screen right now. */
export async function updateReadingProgressAction(articleId: string, progress: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await updateReadingProgress(user.id, articleId, progress);
}
