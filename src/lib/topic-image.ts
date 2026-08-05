import "server-only";
import { fetchTopicPhoto } from "@/lib/pexels";
import { fetchBundledTopicPhoto } from "@/lib/topic-photos";
import { SPECIALTY_META } from "@/lib/meta";
import type { Article } from "@/lib/types";

// Common PT/anatomical terms worth searching for specifically when an article's title
// mentions one — a much more specific (and more visually relevant) Pexels result than
// searching the specialty alone every time. Checked against the title in this order, first
// match wins, so more specific terms (e.g. "acl") are listed ahead of generic ones.
const TOPIC_KEYWORDS = [
  "acl", "rotator cuff", "plantar fasciitis", "knee", "shoulder", "hip", "spine",
  "low back", "back pain", "neck", "ankle", "elbow", "wrist", "vestibular", "stroke",
  "balance", "gait", "concussion", "sports injury", "post-surgical",
];

/** The specific anatomical/topical term from an article's title, when one's recognizable —
 *  used both to build the Pexels query and to pick a tag-matched bundled photo below. */
function matchedTopic(article: Article): string | null {
  const titleLower = article.title.toLowerCase();
  return TOPIC_KEYWORDS.find((kw) => titleLower.includes(kw)) ?? null;
}

/** Builds a Pexels search query out of an article — a specific anatomical/topical term from
 *  the title when one's recognizable (e.g. "knee physical therapy"), otherwise just the
 *  article's specialty (e.g. "Orthopedic physical therapy rehabilitation") so every article
 *  still resolves to *something* searchable. */
function topicQueryFor(article: Article): string {
  const topic = matchedTopic(article);
  if (topic) return `${topic} physical therapy`;
  return `${SPECIALTY_META[article.specialty]} physical therapy rehabilitation`;
}

/** Fills in `image` for any article that doesn't already have one (i.e. didn't get a real
 *  og:image from lib/og-image.ts attachRealImages — most seed/guideline-PDF content, which
 *  has no og:image to find at all) with a real photo matched to its topic. Tries Pexels first
 *  (most specific per-article match, but returns null when PEXELS_API_KEY isn't set or the
 *  search comes back empty — see lib/pexels.ts), then falls back to the bundled Commons pool
 *  (lib/topic-photos.ts), which never fails, so every article ends up with a real picture
 *  either way. */
export async function attachTopicImages<T extends Article>(articles: T[]): Promise<T[]> {
  return Promise.all(
    articles.map(async (a) => {
      if (a.image) return a;
      const pexelsImage = await fetchTopicPhoto(topicQueryFor(a), a.id);
      if (pexelsImage) return { ...a, image: pexelsImage };
      const topic = matchedTopic(a);
      const tagHints = topic ? [topic, a.specialty] : [a.specialty];
      return { ...a, image: fetchBundledTopicPhoto(tagHints, a.id) };
    })
  );
}
