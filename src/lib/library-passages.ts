/**
 * Turns a served document — a playbook from content/playbooks, or an Exam Prep study guide
 * from content/exam-prep — into the passages library search ranks. See lib/library-search.ts
 * for the ranking, lib/library-sources.ts for which documents are indexed, and
 * lib/library-index.ts for the filesystem read this pairs with.
 *
 * Why this exists at all: each playbook already ships an in-page "Filter" box, but it indexes
 * five kinds of unit (table rows, numcells, reference entries, drill cases and callouts) and
 * nothing else, so prose paragraphs — every `p.statnote` among them — cannot be matched by
 * it, and it only ever searches the one document it lives in. The study guides have no
 * cross-document search either. This module is the index that covers both.
 *
 * **The two families do not share markup.** A playbook keeps its answers in tables, numcells
 * and drill cases; an Exam Prep guide keeps them in `div.kp` key-point blocks, each holding a
 * prompt, an answer and a `details.bd` breakdown, and has no numcells at all. Forcing one
 * selector list over both does not fail loudly — it fails by returning plausible rubbish.
 * Running the playbook selectors over a study guide yields *more* passages, not fewer (256
 * against 212 for the cervical guide), because each key point disintegrates into its
 * constituent paragraphs: the reader gets half an answer per result and the card that holds
 * the prompt, answer and breakdown together never appears. So the unit selectors are a
 * per-family profile and the machinery around them is shared.
 *
 * It parses rather than pattern-matches. The guide routes deliberately treat these files as
 * opaque bytes ("the bytes are the deliverable" — see lib/guides.ts), and this module does
 * not change that: it never rewrites a document, it only reads one. But it does couple to the
 * authored markup, which is the real cost of having search at all. Rename a class and the
 * matching passages leave the index silently. library-passages.test.ts asserts a floor per
 * document and per kind so that failure lands in CI instead of in a student's results.
 *
 * Deliberately free of `server-only` and of any filesystem access: it takes HTML as a
 * string so node:test can exercise it directly, the same convention lib/classify.ts and
 * lib/patient-progress.ts document.
 */

import { parse, type HTMLElement } from "node-html-parser";

/** What kind of thing a passage is. Ranking leans on this — a query that reads like a
 *  statistic should prefer the cell that holds one, and a heading match says the whole
 *  section is about the query rather than mentioning it once.
 *
 *  `keypoint` is the Exam Prep families' equivalent of a playbook's `row`: the unit a student
 *  is actually revising from, prompt and answer together. */
export type PassageKind =
  | "heading"
  | "prose"
  | "statnote"
  | "callout"
  | "row"
  | "number"
  | "reference"
  | "case"
  | "keypoint";

/**
 * Which selectors find the answers in one family of document.
 *
 * `units` runs in order, and a unit claims its subtree: anything matched later that sits
 * inside an already-claimed element is skipped, so a breakdown nested in a key point does not
 * become a second result for the same answer. That ordering is the only reason this reads as
 * a list rather than a tangle of exclusions, so keep the containing units first.
 */
export interface ExtractionProfile {
  /** Selector and the kind it produces, outermost-first. */
  units: Array<{ selector: string; kind: PassageKind }>;
  /** Table rows are handled separately from `units` because a row's cells are joined rather
   *  than read as one run of text. Empty to skip tables entirely. */
  rowSelector?: string;
  /** Section ids whose headings are not topics — a bibliography's heading is a paper title,
   *  and under the heading boost it outranks the passage that answers the query. */
  skipHeadingSections?: string[];
}

/**
 * The served playbooks (content/playbooks). The first five units are what the in-page Filter
 * box already indexes; `p.statnote` and the prose fallback are what it cannot reach.
 */
export const PLAYBOOK_PROFILE: ExtractionProfile = {
  rowSelector: "section table tbody tr",
  units: [
    { selector: "#drill details", kind: "case" },
    { selector: ".callout", kind: "callout" },
    { selector: ".numcell", kind: "number" },
    { selector: "#refs li", kind: "reference" },
    { selector: "p.statnote", kind: "statnote" },
  ],
  skipHeadingSections: ["refs"],
};

/**
 * The Exam Prep study guides (content/exam-prep).
 *
 * `div.kp` comes first and deliberately swallows its children: each key point holds a prompt
 * (`div.q`), an answer (`div.a`) and a `details.bd` breakdown, and a student searching for
 * any of those wants the whole card, not three rows pointing at the same place. The bare
 * `details` entry below it then picks up the practical skill check-offs in `#skills`, which
 * are not inside a key point.
 *
 * These documents carry no `.numcell` and no `p.statnote`; listing selectors that match
 * nothing would only invite someone to assume they do.
 */
export const EXAM_PREP_PROFILE: ExtractionProfile = {
  rowSelector: "section table tbody tr",
  units: [
    { selector: "div.kp", kind: "keypoint" },
    { selector: "details", kind: "case" },
    { selector: ".callout", kind: "callout" },
    { selector: "#refs li", kind: "reference" },
  ],
  skipHeadingSections: ["refs"],
};

export interface LibraryPassage {
  /** Which guide this came from — also the entitlement unit, since access is per slug. */
  slug: string;
  /** The enclosing `<section>`'s id, which is what a result deep-links to. Empty when a
   *  passage sits outside any identified section; such a passage still ranks, it just links
   *  to the top of the document. */
  sectionId: string;
  /** That section's `<h2>`, for naming the result in the UI. */
  heading: string;
  kind: PassageKind;
  /** Readable text, whitespace-collapsed but otherwise as authored — this is both what gets
   *  tokenized and what the snippet is cut from, so it keeps its original punctuation and
   *  casing. Normalization happens at tokenize time in lib/library-search.ts. */
  text: string;
}

/** Controls the playbook's own scripts inject, plus the authored Recall/Hide buttons. None
 *  of them are content, and leaving them in would put "Recall" and "Hide missed" into the
 *  text of every table in the library. The in-page filter strips the same set. */
const CONTROL_SELECTORS = ["script", "style", "button", ".missbtn", ".addwrap", ".colmask", ".lanetag"];

/** Shortest text worth indexing. Below this a passage is an empty cell or a stray
 *  punctuation node, and it would only ever appear as noise. */
const MIN_TEXT = 3;

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * The text of an element, with a boundary at every element edge.
 *
 * node-html-parser's `.text` concatenates descendants with nothing between them, which in
 * these documents welds words together across markup: a numcell's value and its caption
 * become "≥ 55 yearsThe first of the five…", and a provenance chip becomes
 * "ConventionKnee flexion". That is not only unreadable in a result snippet — it costs
 * retrieval, because "yearsthe" is one token and neither "years" nor "the" can match it.
 * `structuredText` fixes the block case but not the inline chips, so the walk is written out.
 *
 * Spaces that land in front of punctuation are pulled back afterwards, so inserting the
 * boundary does not turn "1.06," into "1.06 ,".
 */
function textOf(el: HTMLElement): string {
  const parts: string[] = [];

  const walk = (node: { nodeType: number; text?: string; childNodes?: unknown[] }) => {
    if (node.nodeType === 3) {
      parts.push(node.text ?? "");
      return;
    }
    if (node.nodeType !== 1) return;
    parts.push(" ");
    for (const child of (node.childNodes ?? []) as typeof node[]) walk(child);
    parts.push(" ");
  };

  for (const child of el.childNodes as unknown as Parameters<typeof walk>[0][]) walk(child);

  return collapse(parts.join("")).replace(/\s+([,.;:!?%)\]°])/g, "$1");
}

/** Walks up the ancestor chain testing each element. node-html-parser has `closest`, but it
 *  is selector-driven and this needs to ask several structural questions at once (am I in a
 *  table, a numcell, the references list?), so the walk is written out rather than expressed
 *  as four selector strings whose support would have to be verified separately. */
function hasAncestor(el: HTMLElement, test: (candidate: HTMLElement) => boolean): boolean {
  let current = el.parentNode as HTMLElement | null;
  while (current && current.nodeType === 1) {
    if (test(current)) return true;
    current = current.parentNode as HTMLElement | null;
  }
  return false;
}

function hasClass(el: HTMLElement, name: string): boolean {
  return el.classList?.contains(name) ?? false;
}

function tag(el: HTMLElement): string {
  return (el.tagName || "").toLowerCase();
}

/** The section an element belongs to, and that section's heading. A playbook's sections are
 *  flat — no nesting — so the nearest `<section>` ancestor is the only candidate. */
function locate(el: HTMLElement, headings: Map<HTMLElement, { id: string; heading: string }>): { id: string; heading: string } {
  let current = el.parentNode as HTMLElement | null;
  while (current && current.nodeType === 1) {
    const hit = headings.get(current);
    if (hit) return hit;
    current = current.parentNode as HTMLElement | null;
  }
  return { id: "", heading: "" };
}

/**
 * Extracts every searchable passage from one served document.
 *
 * Beyond the profile's own units, every document contributes its prose paragraphs and its
 * headings. A paragraph inside a unit is not emitted twice — the containing unit already
 * carries its text, and two hits on one sentence would push a second real answer off the
 * page.
 */
export function extractPassages(
  slug: string,
  html: string,
  profile: ExtractionProfile = PLAYBOOK_PROFILE
): LibraryPassage[] {
  const root = parse(html);

  for (const selector of CONTROL_SELECTORS) {
    for (const node of root.querySelectorAll(selector)) node.remove();
  }

  // Index sections up front so every passage can name the anchor it links to without
  // re-walking the tree for each one.
  const sections = new Map<HTMLElement, { id: string; heading: string }>();
  for (const section of root.querySelectorAll("section")) {
    sections.set(section, {
      id: section.getAttribute("id") ?? "",
      heading: collapse(section.querySelector("h2")?.text ?? ""),
    });
  }

  const passages: LibraryPassage[] = [];
  const claimed = new Set<HTMLElement>();

  const push = (el: HTMLElement, kind: PassageKind, text: string) => {
    const clean = collapse(text);
    if (clean.length < MIN_TEXT) return;
    const { id, heading } = locate(el, sections);
    passages.push({ slug, sectionId: id, heading, kind, text: clean });
    claimed.add(el);
  };

  // A table row is one finding, which is the unit a student is usually after. `.group` rows
  // are full-width subheadings rather than data, so they carry no answer of their own.
  if (profile.rowSelector) {
    for (const row of root.querySelectorAll(profile.rowSelector)) {
      if (hasClass(row, "group")) continue;
      const cells = row.querySelectorAll("th, td").map((cell) => textOf(cell)).filter(Boolean);
      if (cells.length === 0) continue;
      push(row, "row", cells.join(" · "));
    }
  }

  // The profile's units, outermost first. A unit inside an already-claimed one is skipped:
  // the Exam Prep guides nest a `details.bd` breakdown inside every `div.kp`, and indexing
  // both would spend two result rows on one key point.
  for (const { selector, kind } of profile.units) {
    for (const el of root.querySelectorAll(selector)) {
      if (claimed.has(el) || hasAncestor(el, (ancestor) => claimed.has(ancestor))) continue;
      push(el, kind, textOf(el));
    }
  }

  // Prose last among the text units, and only where no unit already carries it — the
  // paragraphs inside a callout, a drill case or a key point are that unit's text.
  for (const paragraph of root.querySelectorAll("section p")) {
    if (claimed.has(paragraph)) continue;
    if (hasAncestor(paragraph, (el) => claimed.has(el) || tag(el) === "table")) continue;
    push(paragraph, "prose", textOf(paragraph));
  }

  // Headings last: a section's own title is the strongest signal that the section is about
  // the query rather than merely mentioning it, and ranking boosts this kind for that
  // reason. h3s come along because the longer guides use them to name a region or a test
  // family that no h2 repeats.
  //
  // The references section is the exception. Its headings are the titles of cited papers and
  // of the list itself, so under the heading boost a query like "mobilization" surfaced
  // "Effects of mobilization and manipulation" — a bibliography entry — above the passage
  // that answers it. A citation is reachable as a `reference` passage either way.
  const skipHeadings = new Set(profile.skipHeadingSections ?? []);
  for (const heading of root.querySelectorAll("section h2, section h3")) {
    if (skipHeadings.has(locate(heading, sections).id)) continue;
    push(heading, "heading", textOf(heading));
  }

  return passages;
}
