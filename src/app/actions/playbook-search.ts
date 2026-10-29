"use server";

import { GUIDES, guideHref, guideIsReadable } from "@/lib/guides";
import { isSiteAdmin } from "@/lib/admin";
import { getCurrentUser, hasStudentAccess, hasPlaybookAccess } from "@/lib/session";
import { playbookIndex } from "@/lib/playbook-index";
import { expandPlaybookQuery } from "@/lib/playbook-query-expansion";
import {
  bestCoverage,
  guideAffinity,
  queryTerms,
  rank,
  snippet,
  splitByEntitlement,
  weightTerms,
  type SnippetSegment,
} from "@/lib/playbook-search";
import type { PassageKind } from "@/lib/playbook-passages";

/**
 * Cross-playbook search: one query, every served playbook, ranked.
 *
 * A Server Action rather than a route handler because that is how search already works here
 * (see actions/ai-search.ts behind components/SearchScreen.tsx) and because AGENTS.md asks
 * for actions over hand-rolled API routes. Nothing here mutates, so there is no revalidation
 * and the response carries only its return value.
 *
 * The action is the security boundary, not the UI that calls it. A Server Action is a POST
 * endpoint reachable by anyone who can send the request, so the tier check and the per-slug
 * entitlement filter below are what actually withhold paid content — the fact that the search
 * box only renders on a gated page is not a check.
 */

/** Results past this point are noise on a corpus this size, and every one costs a snippet. */
const MAX_HITS = 24;

/** How many passages to rank before entitlement is applied.
 *
 *  Has to be well above MAX_HITS. A reader on the free tier holds one guide of seven, so the
 *  best two dozen passages in the library can easily be entirely locked — ranking only
 *  MAX_HITS and then filtering would hand them an empty page while their own guide held the
 *  answer further down. Ranking wide and truncating after the filter also makes the locked
 *  count honest rather than an artefact of where the cut fell. */
const CANDIDATES = 300;

/** Length of the snippet window, in characters. Two lines at the result width. */
const SNIPPET_CHARS = 220;

export interface PlaybookSearchHit {
  slug: string;
  guideName: string;
  /** Deep link to the section the passage sits in. */
  href: string;
  /** The section's heading, for naming the result. */
  heading: string;
  kind: PassageKind;
  /** Pre-cut snippet with the matches marked, so the client renders elements rather than
   *  interpolating a playbook's own text as markup. */
  segments: SnippetSegment[];
}

export interface PlaybookSearchResponse {
  query: string;
  hits: PlaybookSearchHit[];
  /** Guides that matched but this reader has not unlocked — a name and a count, never text. */
  locked: { name: string; matches: number }[];
  /** Terms the expansion layer added, so the UI can say what else it looked for. Empty when
   *  the query was answered as typed, which is the common case. */
  expandedWith: string[];
  /** True when no passage covered the query as typed and expansion has not been tried, so the
   *  UI can offer it rather than leaving the reader with thin results and no next move. */
  canExpand: boolean;
  /** True when the reader has no student access at all, so the UI can point at the gate
   *  instead of reporting an empty library. */
  gated: boolean;
}

function empty(query: string, gated = false): PlaybookSearchResponse {
  return { query, hits: [], locked: [], expandedWith: [], canExpand: false, gated };
}

/**
 * `expand` is what separates typing from asking.
 *
 * The box searches as the reader types, and a half-typed word almost never has full coverage
 * — "menis" is in no passage — so an unconditional expansion would fire a model call on
 * nearly every keystroke, for a query the reader has not finished writing. So live typing
 * stays lexical and instant, and the expansion layer runs when they submit. The flag can only
 * ask for work the reader could ask for anyway, so it carries no authority: everything that
 * withholds content is below, keyed on the session.
 */
export async function searchPlaybooksAction(
  rawQuery: string,
  { expand = false }: { expand?: boolean } = {}
): Promise<PlaybookSearchResponse> {
  const query = rawQuery.trim().slice(0, 200);
  if (query.length < 2) return empty(query);

  const user = await getCurrentUser();
  if (!user) return empty(query, true);
  if (!hasStudentAccess(user)) return empty(query, true);

  const admin = await isSiteAdmin();

  // An unpublished guide is excluded for an ordinary reader exactly as the route excludes it,
  // so search cannot be the thing that reveals one. No guide carries the flag today; this
  // keeps search honest when the next one is being written.
  const searchable = GUIDES.filter((guide) => guideIsReadable(guide, admin));
  const names = new Map(searchable.map((guide) => [guide.slug, guide.name]));
  const hrefs = new Map(searchable.map((guide) => [guide.slug, guideHref(guide)]));

  const index = await playbookIndex();
  const own = queryTerms(query);
  if (own.length === 0) return empty(query);

  const affinity = guideAffinity(own, searchable);
  const lexical = rank(index, weightTerms(own, []), query, { limit: CANDIDATES, slugWeights: affinity });

  // Expansion runs only when no passage in the library contains every word the reader typed.
  // That is the precise signal that the reader's vocabulary and the document's differ — the
  // case this layer exists for — and it means an exact query (a test name, a decimal value,
  // an abbreviation) never pays the latency, the cost, or the risk of being pulled off target.
  let ranked = lexical;
  let expandedWith: string[] = [];
  const thin = bestCoverage(lexical) < 1;
  if (expand && thin) {
    const expanded = await expandPlaybookQuery(query);
    if (expanded.length > 0) {
      const terms = weightTerms(own, expanded);
      const widened = rank(index, terms, query, { limit: CANDIDATES, slugWeights: affinity });
      // Only adopt the widened ranking if it actually found something. An expansion that
      // returns terms the corpus does not use should leave the reader with the lexical
      // results rather than nothing.
      if (widened.length > 0) {
        ranked = widened;
        expandedWith = expanded;
      }
    }
  }

  // Passages from a guide this reader has not unlocked are removed here, after ranking. The
  // snippet *is* the paid content, so a locked guide contributes a name and a count only.
  const { visible, locked } = splitByEntitlement(ranked, (slug) =>
    admin ? true : hasPlaybookAccess(user, slug)
  );

  // Highlight on the reader's own terms plus whatever expansion added, so a result that only
  // matched a paraphrase still shows why it is there.
  const highlight = [...own, ...expandedWith.flatMap((term) => term.split(/\s+/))];

  return {
    query,
    hits: visible.slice(0, MAX_HITS).map((hit) => ({
      slug: hit.passage.slug,
      guideName: names.get(hit.passage.slug) ?? hit.passage.slug,
      href: `${hrefs.get(hit.passage.slug) ?? ""}${hit.passage.sectionId ? `#${hit.passage.sectionId}` : ""}`,
      heading: hit.passage.heading,
      kind: hit.passage.kind,
      segments: snippet(hit.passage.text, highlight, SNIPPET_CHARS),
    })),
    locked: locked.map((entry) => ({ name: names.get(entry.slug) ?? entry.slug, matches: entry.matches })),
    expandedWith,
    canExpand: thin && expandedWith.length === 0,
    gated: false,
  };
}
