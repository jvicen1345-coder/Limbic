import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { CLIPS } from "@/lib/clips-static";
import { orderClipsForUser } from "@/lib/clip-rotation";
import { ClipsFeed } from "@/components/ClipsFeed";

export default async function ClipsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const savedRows = await prisma.savedClip.findMany({
    where: { userId: user.id },
    select: { clipId: true },
  });
  const savedClipIds = savedRows.map((r) => r.clipId);
  const seenIds = (user.clipsSeenIds as string[]) ?? [];
  const clips = orderClipsForUser(CLIPS, seenIds);

  return <ClipsFeed clips={clips} savedClipIds={savedClipIds} />;
}
