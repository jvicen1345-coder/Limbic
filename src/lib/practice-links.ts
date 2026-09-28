import { ORTHOPT_CPG_SEED } from "@/lib/orthopt-cpg-static";
import { OUTCOME_MEASURES } from "@/lib/outcome-measures";
import { topicsForArticle, type EvidenceTopic } from "@/lib/evidence-topics";

/**
 * "Put it into practice" — the bridge from one study to the things a reader can actually do
 * next, shown under the breakdown on the article page and the public study page.
 *
 * Everything is derived from the article's condition topics (lib/evidence-topics.ts), so a
 * study only links to a guideline, test or measure for a condition it is actually about. A
 * study that matches no topic gets no links rather than generic ones.
 */

export interface PracticeLink {
  label: string;
  /** One short line on why this link is here. */
  hint: string;
  href: string;
  external?: boolean;
}

export interface PracticeLinks {
  topics: { slug: string; name: string }[];
  guidelines: PracticeLink[];
  tools: PracticeLink[];
}

export function practiceLinksFor(
  article: { id: string; title: string; tags: string[] },
  opts: { publicView?: boolean } = {}
): PracticeLinks | null {
  const topics = topicsForArticle(article);
  if (topics.length === 0) return null;

  const guidelines: PracticeLink[] = [];
  const seenCpg = new Set<string>();
  for (const t of topics) {
    for (const id of t.cpgIds) {
      if (seenCpg.has(id) || id === article.id) continue;
      seenCpg.add(id);
      const cpg = ORTHOPT_CPG_SEED.find((c) => c.id === id);
      if (!cpg) continue;
      guidelines.push({
        label: cpg.title,
        hint: `Clinical practice guideline, ${cpg.date.slice(0, 4)}`,
        // The signed-out view can't open /article/*, so it links to the guideline itself.
        href: opts.publicView ? cpg.sourceUrl ?? `/evidence/topics/${t.slug}` : `/article/${cpg.id}`,
        external: opts.publicView && !!cpg.sourceUrl,
      });
    }
  }

  return {
    topics: topics.map((t) => ({ slug: t.slug, name: t.name })),
    guidelines,
    tools: toolLinks(topics),
  };
}

function toolLinks(topics: EvidenceTopic[]): PracticeLink[] {
  const links: PracticeLink[] = [];
  const measureIds = [...new Set(topics.flatMap((t) => t.measureIds))].slice(0, 4);
  const measures = measureIds
    .map((id) => OUTCOME_MEASURES.find((m) => m.id === id))
    .filter((m): m is (typeof OUTCOME_MEASURES)[number] => !!m);
  if (measures.length > 0) {
    links.push({
      label: `Score it: ${measures.map((m) => m.abbreviation).join(", ")}`,
      hint: "Outcome measures used for this condition, with MCIDs",
      href: "/pro/calculators",
    });
  }
  const region = topics.find((t) => t.atlasRegion)?.atlasRegion;
  if (region) {
    links.push({
      label: "Special tests for this region",
      hint: "Technique, positive finding and diagnostic accuracy",
      href: `/pro/special-tests?region=${encodeURIComponent(region)}`,
    });
  }
  links.push({
    label: "Build a home exercise program",
    hint: "Turn the intervention into a program you can hand a patient",
    href: "/hep",
  });
  links.push({
    label: "Quiz yourself",
    hint: "Board-style questions to lock in what you read",
    href: "/boards",
  });
  return links;
}
