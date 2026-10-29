/**
 * Turns a served playbook (content/playbooks/<slug>.html) into the passages that
 * cross-playbook search ranks — see lib/playbook-search.ts for the ranking and
 * lib/playbook-index.ts for the filesystem read this pairs with.
 *
 * Why this exists at all: each playbook already ships an in-page "Filter" box, but it
 * indexes five kinds of unit (table rows, numcells, reference entries, drill cases and
 * callouts) and nothing else, so prose paragraphs — 194 of the 219 in the library, every
 * `p.statnote` among them — cannot be matched by it, and it only ever searches the one
 * document it lives in. This module is the cross-playbook index that fixes both.
 *
 * It parses rather than pattern-matches. The guide route deliberately treats these files as
 * opaque bytes ("the bytes are the deliverable" — see lib/guides.ts), and this module does
 * not change that: it never rewrites a playbook, it only reads one. But it does couple to
 * the authored markup, which is the real cost of having search at all. Rename a class in a
 * playbook and the matching passages leave the index silently. playbook-passages.test.ts
 * asserts a floor per guide and per kind so that failure lands in CI instead of in a
 * student's results.
 *
 * Deliberately free of `server-only` and of any filesystem access: it takes HTML as a
 * string so node:test can exercise it directly, the same convention lib/classify.ts and
 * lib/patient-progress.ts document.
 */

import { parse, type HTMLElement } from "node-html-parser";

/** What kind of thing a passage is. Ranking leans on this — a query that reads like a
 *  statistic should prefer the cell that holds one, and a heading match says the whole
 *  section is about the query rather than mentioning it once. */
export type PassageKind =
  | "heading"
  | "prose"
  | "statnote"
  | "callout"
  | "row"
  | "number"
  | "reference"
  | "case";

export interface PlaybookPassage {
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
   *  casing. Normalization happens at tokenize time in lib/playbook-search.ts. */
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
 * Extracts every searchable passage from one playbook document.
 *
 * The unit types are the five the in-page filter already indexes, plus the three it does
 * not: prose paragraphs, statnotes, and the headings themselves. A paragraph that sits
 * inside one of the other units is not emitted twice — the containing unit already carries
 * its text, and two hits on the same sentence would push a second real answer off the page.
 */
export function extractPassages(slug: string, html: string): PlaybookPassage[] {
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

  const passages: PlaybookPassage[] = [];
  const claimed = new Set<HTMLElement>();

  const push = (el: HTMLElement, kind: PassageKind, text: string) => {
    const clean = collapse(text);
    if (clean.length < MIN_TEXT) return;
    const { id, heading } = locate(el, sections);
    passages.push({ slug, sectionId: id, heading, kind, text: clean });
    claimed.add(el);
  };

  // --- the units the in-page filter already knows about ---

  // A table row is one finding, which is the unit a student is usually after. `.group` rows
  // are full-width subheadings rather than data, so they carry no answer of their own.
  for (const row of root.querySelectorAll("section table tbody tr")) {
    if (hasClass(row, "group")) continue;
    const cells = row.querySelectorAll("th, td").map((cell) => textOf(cell)).filter(Boolean);
    if (cells.length === 0) continue;
    push(row, "row", cells.join(" · "));
  }

  for (const cell of root.querySelectorAll(".numcell")) push(cell, "number", textOf(cell));
  for (const entry of root.querySelectorAll("#refs li")) push(entry, "reference", textOf(entry));
  for (const drill of root.querySelectorAll("#drill details")) push(drill, "case", textOf(drill));
  for (const callout of root.querySelectorAll(".callout")) push(callout, "callout", textOf(callout));

  // --- the units it does not ---

  // `p.statnote` is a bare paragraph, not a `.callout` div, which is the whole reason all 13
  // of them in the library are invisible to the in-page filter. They are also some of the
  // densest writing in these documents, so they are indexed as their own kind rather than as
  // ordinary prose.
  for (const note of root.querySelectorAll("p.statnote")) push(note, "statnote", textOf(note));

  for (const paragraph of root.querySelectorAll("section p")) {
    if (claimed.has(paragraph)) continue;
    // Skip a paragraph whose text another unit already carries. Without this, the prose
    // inside a callout or a drill case is indexed twice and one answer occupies two result
    // rows.
    const nested = hasAncestor(
      paragraph,
      (el) =>
        tag(el) === "table" ||
        tag(el) === "details" ||
        hasClass(el, "numcell") ||
        hasClass(el, "callout") ||
        el.getAttribute("id") === "refs" ||
        el.getAttribute("id") === "drill"
    );
    if (nested) continue;
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
  for (const heading of root.querySelectorAll("section h2, section h3")) {
    if (locate(heading, sections).id === "refs") continue;
    push(heading, "heading", textOf(heading));
  }

  return passages;
}
