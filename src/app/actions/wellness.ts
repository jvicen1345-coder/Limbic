"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getWellnessArticles, WELLNESS_VIDEOS } from "@/lib/articles";
import { computeWellnessSet, withOpenedId, WELLNESS_ARTICLE_TARGET, WELLNESS_VIDEO_TARGET } from "@/lib/wellness-rotation";

/** Recomputes both the article and video sets, swapping out anything the reader has opened
 *  since they were last shown for unopened pool candidates — see lib/wellness-rotation.ts
 *  computeWellnessSet for the actual keep/replace logic. Unlike a plain page load, this is
 *  the one path that's allowed to drop opened items even though they're still valid. */
export async function refreshWellnessAction() {
  const user = await getCurrentUser();
  if (!user) return;

  const articlePool = await getWellnessArticles();
  const openedIds = (user.wellnessOpenedIds as string[]) ?? [];

  const nextArticleIds = computeWellnessSet(
    articlePool.map((a) => a.id),
    (user.wellnessArticleIds as string[]) ?? [],
    openedIds,
    WELLNESS_ARTICLE_TARGET,
    true
  );
  const nextVideoIds = computeWellnessSet(
    WELLNESS_VIDEOS.map((v) => v.id),
    (user.wellnessVideoIds as string[]) ?? [],
    openedIds,
    WELLNESS_VIDEO_TARGET,
    true
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { wellnessArticleIds: nextArticleIds, wellnessVideoIds: nextVideoIds },
  });
  revalidatePath("/wellness");
}

/** Fired when a reader opens an article or video (see components/RowCards.tsx
 *  WellnessListItem and app/(app)/wellness/page.tsx) — doesn't change what's on screen by
 *  itself, just marks the id so the next Refresh knows to swap it out. */
export async function markWellnessOpenedAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const openedIds = (user.wellnessOpenedIds as string[]) ?? [];
  const next = withOpenedId(openedIds, id);
  if (next === openedIds) return;
  await prisma.user.update({ where: { id: user.id }, data: { wellnessOpenedIds: next } });
}

interface WellnessSaveSnapshot {
  title: string;
  source: string;
  /** Absent for a seed wellness article, which has no external story — see the
   *  sourceUrl field comment on the SavedWellness model. */
  sourceUrl?: string;
  date?: string;
  readMins?: number;
  summary?: string;
  duration?: string;
}

/** Same toggle-by-id pattern as app/actions/saved.ts toggleSaveAction, snapshotting display
 *  fields at save time since wellness content rotates per-user and isn't guaranteed to
 *  still be in anyone's current pool later (see lib/wellness-rotation.ts). */
export async function toggleSaveWellnessAction(itemId: string, kind: "article" | "video", snapshot: WellnessSaveSnapshot) {
  const user = await getCurrentUser();
  if (!user) return;
  const existing = await prisma.savedWellness.findUnique({
    where: { userId_itemId: { userId: user.id, itemId } },
  });
  if (existing) {
    await prisma.savedWellness.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedWellness.create({
      data: {
        userId: user.id,
        itemId,
        kind,
        title: snapshot.title,
        source: snapshot.source,
        sourceUrl: snapshot.sourceUrl ?? null,
        date: snapshot.date ?? null,
        readMins: snapshot.readMins ?? null,
        summary: snapshot.summary ?? null,
        duration: snapshot.duration ?? null,
      },
    });
  }
  revalidatePath("/", "layout");
}
