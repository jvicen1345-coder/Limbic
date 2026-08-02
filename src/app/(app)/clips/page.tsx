import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getClips } from "@/lib/clips";
import { orderClipsForUser } from "@/lib/clip-rotation";
import { ClipsFeed } from "@/components/ClipsFeed";

export default async function ClipsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [pool, savedRows] = await Promise.all([
    getClips(),
    prisma.savedClip.findMany({ where: { userId: user.id }, select: { clipId: true } }),
  ]);
  const savedClipIds = savedRows.map((r) => r.clipId);
  const seenIds = (user.clipsSeenIds as string[]) ?? [];
  const clips = orderClipsForUser(pool, seenIds);

  // orderClipsForUser shuffles fresh on every call, so this key changes on essentially
  // every request — keying on it forces a clean remount of ClipsFeed instead of the
  // refresh button's router.refresh() silently doing nothing, since a Server Component
  // prop update alone doesn't reset a client child's already-initialized local state.
  const feedKey = clips.map((c) => c.id).join(",");

  return <ClipsFeed key={feedKey} clips={clips} savedClipIds={savedClipIds} />;
}
