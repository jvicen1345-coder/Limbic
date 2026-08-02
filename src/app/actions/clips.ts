"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { withSeenId } from "@/lib/seen-tracking";
import { MAX_CLIPS_SEEN_HISTORY } from "@/lib/clip-rotation";

/** Fired when a clip becomes the active (autoplaying) slide — see components/ClipsFeed.tsx
 *  — so the next visit's lib/clip-rotation.ts ordering can put never-seen clips first. */
export async function markClipSeenAction(clipId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const seenIds = (user.clipsSeenIds as string[]) ?? [];
  const next = withSeenId(seenIds, clipId, MAX_CLIPS_SEEN_HISTORY);
  if (next === seenIds) return;
  await prisma.user.update({ where: { id: user.id }, data: { clipsSeenIds: next } });
}

interface ClipSaveSnapshot {
  title: string;
  source: string;
  url: string;
  specialty: string;
}

/** Same toggle-by-id snapshot pattern as toggleSaveWellnessAction. */
export async function toggleSaveClipAction(clipId: string, snapshot: ClipSaveSnapshot) {
  const user = await getCurrentUser();
  if (!user) return;
  const existing = await prisma.savedClip.findUnique({
    where: { userId_clipId: { userId: user.id, clipId } },
  });
  if (existing) {
    await prisma.savedClip.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedClip.create({
      data: {
        userId: user.id,
        clipId,
        title: snapshot.title,
        source: snapshot.source,
        url: snapshot.url,
        specialty: snapshot.specialty,
      },
    });
  }
  revalidatePath("/", "layout");
}
