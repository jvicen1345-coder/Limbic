import "server-only";
import { fetchTopicPhoto } from "@/lib/pexels";
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

/** Builds a Pexels search query out of an article — a specific anatomical/topical term from
 *  the title when one's recognizable (e.g. "knee physical therapy"), otherwise just the
 *  article's specialty (e.g. "Orthopedic physical therapy rehabilitation") so every article
 *  still resolves to *something* searchable. */
function topicQueryFor(article: Article): string {
  const titleLower = article.title.toLowerCase();
  const topic = TOPIC_KEYWORDS.find((kw) => titleLower.includes(kw));
  if (topic) return `${topic} physical therapy`;
  return `${SPECIALTY_META[article.specialty]} physical therapy rehabilitation`;
}

/** Fills in `image` for any article that doesn't already have one (i.e. didn't get a real
 *  og:image from lib/og-image.ts attachRealImages — most seed/guideline-PDF content, which
 *  has no og:image to find at all) with a real stock photo matched to its topic. Leaves
 *  articles that already have an image untouched, and no-ops per-article (rather than
 *  failing the whole batch) when a topic photo can't be found. */
export async function attachTopicImages<T extends Article>(articles: T[]): Promise<T[]> {
  return Promise.all(
    articles.map(async (a) => {
      if (a.image) return a;
      const image = await fetchTopicPhoto(topicQueryFor(a), a.id);
      return image ? { ...a, image } : a;
    })
  );
}
