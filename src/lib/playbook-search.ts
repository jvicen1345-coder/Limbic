/**
 * Lexical ranking for cross-playbook search — the passages come from
 * lib/playbook-passages.ts, the filesystem read and cache from lib/playbook-index.ts, and
 * the query-expansion layer that feeds extra terms in here from
 * lib/playbook-query-expansion.ts.
 *
 * This is BM25, not embeddings, and that is a decision about this corpus rather than a
 * shortcut. The library is dense with exact tokens a reader types verbatim: 155 distinct
 * decimal statistic values, 70 numcell headline figures, the eponymous test names, and
 * several hundred clinical abbreviations. Dense retrieval is at its worst on precisely those
 * — a rare proper noun gets smeared into its topical neighbourhood, so a passage *about*
 * meniscal testing can outrank the row that names Thessaly. BM25's inverse document
 * frequency does the opposite: the rarer the token, the sharper the hit. What BM25 cannot do
 * is match a reader's words to the document's words when they differ ("gives way" appears
 * nowhere in the knee guide), and that gap is what the expansion layer fills by adding terms
 * rather than by replacing the ranking.
 *
 * Expansion terms arrive weighted below 1 for the same reason: they must be able to lift a
 * paraphrase into range without outvoting a token the reader actually typed.
 *
 * Pure and free of `server-only` so node:test can exercise it — same convention as
 * lib/classify.ts. Nothing here touches the filesystem, the database or the session.
 */

import type { PlaybookPassage, PassageKind } from "@/lib/playbook-passages";

/** Words that carry no retrieval signal in a corpus that is entirely clinical examination
 *  text. Kept deliberately short: this list exists so a question-shaped query ("how do I
 *  test the meniscus") is not dominated by its scaffolding, not to do stemming. Anything
 *  clinically meaningful — "pain", "test", "normal" — stays in, because in this corpus those
 *  are content words even though a general-purpose list would drop them. */
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does", "for", "from",
  "how", "i", "if", "in", "into", "is", "it", "its", "me", "my", "of", "on", "or", "should",
  "so", "that", "the", "their", "them", "then", "there", "these", "this", "to", "was", "what",
  "when", "where", "which", "who", "why", "will", "with", "you", "your",
]);

/** BM25's term-frequency saturation and length-normalization constants, at their standard
 *  values. b = 0.75 matters here because passage length varies by two orders of magnitude —
 *  a numcell is a handful of words and a drill case is several hundred. */
const K1 = 1.2;
const B = 0.75;

/** How much each kind of passage is worth once BM25 has scored its text.
 *
 *  A heading match says the section is *about* the query rather than mentioning it, which is
 *  the single most useful signal in a reference document, so it leads. A numcell is the
 *  answer to a "what's the number" query. References are pushed down because a citation
 *  matching a clinical term is almost never what the reader wanted — when they do want an
 *  author, the phrase boost below carries it back up on its own. */
const KIND_WEIGHT: Record<PassageKind, number> = {
  heading: 1.6,
  number: 1.25,
  statnote: 1.15,
  callout: 1.05,
  row: 1,
  prose: 1,
  case: 0.9,
  reference: 0.7,
};

/** Multiplier for a passage containing the reader's query as a contiguous phrase. This is
 *  what keeps multi-word exact names — "Ottawa knee rule", "pivot shift", an author and year
 *  — above passages that merely contain the same words apart. */
const PHRASE_BOOST = 1.9;

/** A term and how much it counts. Weight 1 is a word the reader typed; anything below that
 *  came from expansion. */
export interface WeightedTerm {
  term: string;
  weight: number;
}

/** What an expansion term is worth against one the reader typed.
 *
 *  Low enough that a passage matching the reader's actual words always beats one matching
 *  only the paraphrase, high enough that several expansion terms landing together can lift a
 *  passage the reader's words miss entirely — which is the whole point of the layer. A
 *  weight of 1 here would let the model's guess at the vocabulary outvote the reader. */
export const EXPANSION_WEIGHT = 0.4;

/**
 * Merges the reader's terms with expansion terms, weighted.
 *
 * A term the reader already typed keeps weight 1 even if expansion returned it too —
 * otherwise an expansion that happened to echo the query would quietly demote it.
 */
export function weightTerms(own: string[], expanded: string[]): WeightedTerm[] {
  const terms: WeightedTerm[] = own.map((term) => ({ term, weight: 1 }));
  const taken = new Set(own);
  for (const raw of expanded) {
    // An expansion term can be a short phrase; it has to be tokenized the same way the
    // corpus was or it could never match.
    for (const token of tokenize(raw)) {
      if (taken.has(token) || STOPWORDS.has(token)) continue;
      taken.add(token);
      terms.push({ term: token, weight: EXPANSION_WEIGHT });
    }
  }
  return terms;
}

export interface PlaybookIndex {
  passages: PlaybookPassage[];
  /** Tokens per passage, parallel to `passages`. */
  tokens: string[][];
  /** Lowercased passage text, parallel to `passages`, for the phrase check. */
  lowered: string[];
  /** Token -> number of passages containing it. */
  df: Map<string, number>;
  avgLength: number;
}

export interface RankedPassage {
  passage: PlaybookPassage;
  score: number;
  /** Fraction of the reader's own terms (weight 1) this passage contains, 0..1. The caller
   *  uses the best coverage across all results to decide whether expansion is needed: a
   *  corpus that cannot cover the query as typed is exactly the case where the reader's
   *  words and the document's words differ. */
  coverage: number;
}

/**
 * Splits text into searchable tokens.
 *
 * Decimals survive whole ("1.06" stays one token) because statistic values are among the
 * most precise queries this corpus supports. A hyphenated term emits both its joined form
 * and its parts, so "concave-convex" is findable as "concave" without losing the compound
 * as a phrase.
 */
export function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9.'-]+/g, " ");

  const out: string[] = [];
  for (const raw of normalized.split(/\s+/)) {
    const token = raw.replace(/^[.'-]+/, "").replace(/[.'-]+$/, "");
    if (!token || token.length > 40) continue;
    out.push(token);
    if (token.includes("-")) {
      for (const part of token.split("-")) {
        if (part.length > 1) out.push(part);
      }
    }
  }
  return out;
}

/** The reader's query reduced to the terms worth matching. Stopwords go, and a single
 *  surviving character goes with them — "a" and "5" alone match most of the library. A
 *  numeric token is kept at any length, since "0.54" and "c5" are real queries. */
export function queryTerms(query: string): string[] {
  const seen = new Set<string>();
  for (const token of tokenize(query)) {
    if (STOPWORDS.has(token)) continue;
    if (token.length < 2 && !/[0-9]/.test(token)) continue;
    seen.add(token);
  }
  return [...seen];
}

export function buildIndex(passages: PlaybookPassage[]): PlaybookIndex {
  const tokens: string[][] = [];
  const lowered: string[] = [];
  const df = new Map<string, number>();
  let totalLength = 0;

  for (const passage of passages) {
    const terms = tokenize(passage.text);
    tokens.push(terms);
    lowered.push(passage.text.toLowerCase());
    totalLength += terms.length;
    for (const term of new Set(terms)) df.set(term, (df.get(term) ?? 0) + 1);
  }

  return {
    passages,
    tokens,
    lowered,
    df,
    avgLength: passages.length > 0 ? totalLength / passages.length : 0,
  };
}

function idf(df: number, total: number): number {
  return Math.log(1 + (total - df + 0.5) / (df + 0.5));
}

export interface RankOptions {
  /** How many ranked passages to return. */
  limit?: number;
  /** At most this many results may share one (slug, sectionId), so a single section cannot
   *  fill the page and hide a better answer elsewhere in the library. */
  perSection?: number;
  /** Per-guide multipliers, for when the query names the region it is about. See
   *  guideAffinity below for why this is load-bearing rather than a refinement. */
  slugWeights?: Map<string, number>;
}

/** How much a passage is worth for coming from the guide the reader named.
 *
 *  Without this, "knee gives way" ranked three *shoulder* rows above every knee passage: the
 *  shoulder guide says "the arm gives way" in so many words while the knee guide calls the
 *  same thing instability, so BM25 answered the question correctly and uselessly. A library
 *  split by body region has to treat a region word as more than one term among three. */
const SLUG_BOOST = 1.6;

/**
 * Works out which guides the query names, by matching its terms against each guide's slug
 * and display name.
 *
 * Takes the registry as a plain list rather than importing GUIDES so this module stays pure
 * and the test can pass synthetic guides.
 */
export function guideAffinity(
  terms: string[],
  guides: Array<{ slug: string; name: string }>
): Map<string, number> {
  const weights = new Map<string, number>();
  const wanted = new Set(terms);
  for (const guide of guides) {
    const label = new Set([...tokenize(guide.slug), ...tokenize(guide.name)]);
    for (const term of wanted) {
      if (label.has(term)) {
        weights.set(guide.slug, SLUG_BOOST);
        break;
      }
    }
  }
  return weights;
}

/**
 * Scores every passage against the weighted terms and returns the best, highest first.
 *
 * `phrase` is the reader's raw query, used only for the contiguous-phrase boost. Pass the
 * query as typed rather than the expansion, or an expansion term would be able to claim a
 * phrase the reader never wrote.
 */
export function rank(
  index: PlaybookIndex,
  terms: WeightedTerm[],
  phrase: string,
  { limit = 40, perSection = 2, slugWeights }: RankOptions = {}
): RankedPassage[] {
  const total = index.passages.length;
  if (total === 0 || terms.length === 0) return [];

  const required = terms.filter((t) => t.weight >= 1).map((t) => t.term);
  const loweredPhrase = phrase.trim().toLowerCase();
  const usePhrase = loweredPhrase.length >= 4 && /\s/.test(loweredPhrase);

  const scored: RankedPassage[] = [];

  for (let i = 0; i < total; i++) {
    const tokens = index.tokens[i];
    if (tokens.length === 0) continue;

    // Term frequencies for this passage, counted once rather than per query term.
    const counts = new Map<string, number>();
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);

    let score = 0;
    let covered = 0;

    for (const { term, weight } of terms) {
      const tf = counts.get(term);
      if (!tf) continue;
      const df = index.df.get(term) ?? 0;
      const denominator = tf + K1 * (1 - B + (B * tokens.length) / (index.avgLength || 1));
      score += weight * idf(df, total) * ((tf * (K1 + 1)) / denominator);
    }

    if (score <= 0) continue;

    for (const term of required) {
      if (counts.has(term)) covered++;
    }

    score *= KIND_WEIGHT[index.passages[i].kind];
    score *= slugWeights?.get(index.passages[i].slug) ?? 1;
    if (usePhrase && index.lowered[i].includes(loweredPhrase)) score *= PHRASE_BOOST;

    scored.push({
      passage: index.passages[i],
      score,
      coverage: required.length > 0 ? covered / required.length : 0,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  const perSectionSeen = new Map<string, number>();
  const out: RankedPassage[] = [];
  for (const hit of scored) {
    const key = `${hit.passage.slug}#${hit.passage.sectionId}`;
    const seen = perSectionSeen.get(key) ?? 0;
    if (seen >= perSection) continue;
    perSectionSeen.set(key, seen + 1);
    out.push(hit);
    if (out.length >= limit) break;
  }
  return out;
}

/** The best coverage any result achieved. 1 means some passage contains every word the
 *  reader typed, so the corpus speaks their language and expansion would only add noise;
 *  below 1 means it does not, which is the case expansion exists for. */
export function bestCoverage(ranked: RankedPassage[]): number {
  let best = 0;
  for (const hit of ranked) {
    if (hit.coverage > best) best = hit.coverage;
  }
  return best;
}

export interface EntitlementSplit {
  /** Results from guides this reader may actually read. */
  visible: RankedPassage[];
  /** Guides that matched but are not unlocked, with how many passages matched. Carries no
   *  passage text — a snippet *is* the paid content, so a locked guide contributes a count
   *  and nothing else. The guide's name and description are already public on the hub, so
   *  naming it back is the upsell the hub already makes, not a leak. */
  locked: { slug: string; matches: number }[];
}

/**
 * Partitions ranked results by whether this reader is entitled to the guide they came from.
 *
 * Entitlement here is per slug, not per tier — a reader without the paid plan gets exactly
 * one guide of their choosing (see hasPlaybookAccess in lib/session.ts) — so this cannot be
 * a single boolean for the whole search. Filtering has to happen per result, after ranking,
 * which is also why it lives in its own function with its own test: a mistake here hands a
 * free-tier reader the text of six paid guides.
 */
export function splitByEntitlement(
  ranked: RankedPassage[],
  isEntitled: (slug: string) => boolean
): EntitlementSplit {
  const visible: RankedPassage[] = [];
  const lockedCounts = new Map<string, number>();

  for (const hit of ranked) {
    if (isEntitled(hit.passage.slug)) {
      visible.push(hit);
    } else {
      lockedCounts.set(hit.passage.slug, (lockedCounts.get(hit.passage.slug) ?? 0) + 1);
    }
  }

  return {
    visible,
    locked: [...lockedCounts.entries()]
      .map(([slug, matches]) => ({ slug, matches }))
      .sort((a, b) => b.matches - a.matches),
  };
}

/** One run of snippet text, flagged if it matched. The UI renders these as elements rather
 *  than interpolating markup, so a playbook's own text can never become HTML on the way to
 *  the browser — the same reason lib/playbook-inline.ts exists for the rendered playbooks. */
export interface SnippetSegment {
  text: string;
  hit: boolean;
}

/**
 * Cuts a readable window out of a passage, centred on the first matching term, with the
 * matches marked.
 *
 * Positions are found by lowercasing only — no dash or quote folding — so every offset maps
 * one-to-one back onto the original text and a snippet can never be sliced mid-character.
 * That means a term differing from the text by punctuation will not be highlighted even
 * though it ranked; showing the right window with one highlight missing is a better failure
 * than showing a window cut at the wrong offset.
 */
export function snippet(text: string, terms: string[], window = 200): SnippetSegment[] {
  const lowered = text.toLowerCase();
  const wanted = terms.map((t) => t.toLowerCase()).filter((t) => t.length > 1);

  // Every match position, shortest-first removed by preferring earlier starts.
  const spans: Array<[number, number]> = [];
  for (const term of wanted) {
    let from = 0;
    for (;;) {
      const at = lowered.indexOf(term, from);
      if (at === -1) break;
      spans.push([at, at + term.length]);
      from = at + term.length;
    }
  }
  spans.sort((a, b) => a[0] - b[0] || b[1] - a[1]);

  // Merge overlaps so "meniscus" and "menisc" cannot produce nested highlights.
  const merged: Array<[number, number]> = [];
  for (const [start, end] of spans) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      if (end > last[1]) last[1] = end;
    } else {
      merged.push([start, end]);
    }
  }

  if (merged.length === 0) {
    return [{ text: text.length > window ? `${text.slice(0, window).trimEnd()}…` : text, hit: false }];
  }

  // Centre the window on the first hit, then pull back to a word boundary at each end so the
  // snippet does not start or finish mid-word.
  const first = merged[0][0];
  let start = Math.max(0, first - Math.floor(window / 3));
  let end = Math.min(text.length, start + window);
  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space < start + 20) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > start) end = space;
  }

  const segments: SnippetSegment[] = [];
  if (start > 0) segments.push({ text: "…", hit: false });

  let cursor = start;
  for (const [hitStart, hitEnd] of merged) {
    if (hitEnd <= start || hitStart >= end) continue;
    const from = Math.max(hitStart, start);
    const to = Math.min(hitEnd, end);
    if (from > cursor) segments.push({ text: text.slice(cursor, from), hit: false });
    segments.push({ text: text.slice(from, to), hit: true });
    cursor = to;
  }
  if (cursor < end) segments.push({ text: text.slice(cursor, end), hit: false });
  if (end < text.length) segments.push({ text: "…", hit: false });

  return segments.filter((segment) => segment.text.length > 0);
}
