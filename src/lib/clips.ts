import "server-only";
import { CLIPS } from "@/lib/clips-static";
import { fetchLiveClips } from "@/lib/clips-live";
import type { Clip } from "@/lib/types";

/** The Clips candidate pool: the hand-curated, individually-verified set (always included)
 *  plus whatever the live YouTube search turns up (see lib/clips-live.ts — empty when
 *  YOUTUBE_API_KEY isn't configured, so this degrades to exactly the static set alone). */
export async function getClips(): Promise<Clip[]> {
  const live = await fetchLiveClips();
  if (live.length === 0) return CLIPS;

  const seen = new Set<string>();
  const combined: Clip[] = [];
  for (const clip of [...CLIPS, ...live]) {
    if (seen.has(clip.id)) continue;
    seen.add(clip.id);
    combined.push(clip);
  }
  return combined;
}
