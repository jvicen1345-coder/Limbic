import { BUNDLED_TOPIC_PHOTOS } from "@/lib/topic-photos-data";
import type { Article } from "@/lib/types";

// Common PT/anatomical terms worth preferring over the broader specialty when choosing a
// bundled photo. Kept here (rather than in the network-backed topic-image module) because
// Home's cold path now uses only this build-time pool.
const TOPIC_KEYWORDS = [
  "acl", "rotator cuff", "plantar fasciitis", "knee", "shoulder", "hip", "spine",
  "low back", "back pain", "neck", "ankle", "elbow", "wrist", "vestibular", "stroke",
  "balance", "gait", "concussion", "sports injury", "post-surgical",
];

export function topicPhotoHints(article: Article): string[] {
  const titleLower = article.title.toLowerCase();
  const topic = TOPIC_KEYWORDS.find((keyword) => titleLower.includes(keyword));
  return topic ? [topic, article.specialty] : [article.specialty];
}

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

function unusedPhotoUrl(tagHints: string[], seed: string, used: Set<string>): string {
  const tagged = BUNDLED_TOPIC_PHOTOS.filter((photo) => photo.tags.some((tag) => tagHints.includes(tag)));
  const preferred = tagged.length > 0 ? tagged : BUNDLED_TOPIC_PHOTOS;
  const pools = preferred === BUNDLED_TOPIC_PHOTOS ? [preferred] : [preferred, BUNDLED_TOPIC_PHOTOS];

  for (const pool of pools) {
    const start = hashToIndex(seed, pool.length);
    for (let offset = 0; offset < pool.length; offset++) {
      const url = pool[(start + offset) % pool.length].url;
      if (!used.has(url)) return url;
    }
  }
  return fetchBundledTopicPhoto(tagHints, seed);
}

/** Synchronous, network-free fallback used on Home's initial render. It walks forward from
 *  each article's deterministic choice when that photo is already claimed, which gives the
 *  hero and seven-card grid distinct photos while the 27-photo bundle has capacity. */
export function attachBundledTopicImages<T extends Article>(articles: T[]): T[] {
  const used = new Set(articles.map((article) => article.image).filter((image): image is string => Boolean(image)));
  return articles.map((article) => {
    if (article.image) return article;
    const image = unusedPhotoUrl(topicPhotoHints(article), article.id, used);
    used.add(image);
    return { ...article, image };
  });
}
