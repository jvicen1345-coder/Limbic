import "server-only";
import { BUNDLED_TOPIC_PHOTOS } from "@/lib/topic-photos-data";

/** Small, deterministic string hash (not cryptographic — just needs to spread article ids
 *  evenly across the pool) so the same article always picks the same bundled photo across
 *  requests, mirroring lib/pexels.ts's hashToIndex. */
function hashToIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % length;
}

/**
 * A real, freely-licensed photo from the bundled Wikimedia Commons pool (see
 * topic-photos-data.ts) — the guaranteed fallback for when Pexels isn't configured or comes
 * back empty (see lib/pexels.ts's fetchTopicPhoto, which returns null in both cases). Unlike
 * Pexels this never fails: the pool is baked into the build, so there's always something to
 * return.
 *
 * `tagHints` narrows to photos tagged with a matching topic/specialty when any exist (e.g. a
 * "knee" article preferentially draws from knee-tagged photos); when nothing matches, the
 * full pool is the fallback so every article still resolves to *something*. `seed` (the
 * article's id) picks a stable photo out of that pool per article, same pattern as Pexels.
 */
export function fetchBundledTopicPhoto(tagHints: string[], seed: string): string {
  const tagged = BUNDLED_TOPIC_PHOTOS.filter((p) => p.tags.some((t) => tagHints.includes(t)));
  const pool = tagged.length > 0 ? tagged : BUNDLED_TOPIC_PHOTOS;
  return pool[hashToIndex(seed, pool.length)].url;
}
