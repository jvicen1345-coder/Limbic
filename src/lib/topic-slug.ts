/** Slug for a topic label — lowercase, spaces to hyphens. Used both to build the Limbic
 *  Agent gap-topic row's link (see components/LimbicAgentCard.tsx, which links to
 *  /?topic=<slug>) and to match that slug back against an article's tags/specialty on
 *  Home (see components/HomeFeed.tsx) — kept in one place so the two never drift out of
 *  sync with each other. */
export function slugifyTopic(label: string): string {
  return label.toLowerCase().trim().replace(/\s+/g, "-");
}
