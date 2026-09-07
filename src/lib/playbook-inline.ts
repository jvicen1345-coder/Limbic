/** Inline markup for Limbic Playbooks (see lib/playbook-content.ts). Playbook prose is
 *  full of emphasis, bolded tissue names and small status pills — spelling each of those
 *  out as nested objects would make the content files unreadable, and storing raw HTML
 *  would mean rendering it with dangerouslySetInnerHTML. So the content files use a tiny
 *  markup convention and this module turns it into plain data the caller renders as JSX,
 *  the same tradeoff lib/study-notes-markdown.ts makes for the Visual Aids page.
 *
 *    **bold**            → <strong>
 *    *emphasis*          → <em>
 *    [[pill:h|Irritating]] → a coloured status pill (tones below)
 *    [[prov:c]] [[prov:x]] → a provenance badge: Convention, or Contested
 *    [[src|Ludewig 2009]] → the citation a value is traced to
 *    \n                  → a line break inside a cell
 *
 *  Deliberately not full Markdown, and deliberately non-nesting: the content never needs
 *  emphasis inside bold, and keeping it flat means the parser can't produce a malformed
 *  tree. An unmatched delimiter is left as literal text rather than throwing. */

/** high / moderate / low irritability, plus `a` for a neutral accent-coloured note pill. */
export type PlaybookPillTone = "h" | "m" | "l" | "a";

/** `c` — a rule of thumb taught everywhere and never measured. `x` — tested, and the
 *  studies disagree. An unmarked value is one traced to a published source. */
export type PlaybookProvenance = "c" | "x";

export type PlaybookInlineNode =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "pill"; tone: PlaybookPillTone; text: string }
  | { type: "prov"; kind: PlaybookProvenance }
  /** The source a value is traced to, set small and quiet beside it. */
  | { type: "src"; text: string }
  | { type: "break" };

const PILL_TONES: PlaybookPillTone[] = ["h", "m", "l", "a"];

/** `**bold**` before `*em*` so the greedier delimiter wins; `[[pill:x|text]]` and a bare
 *  newline are unambiguous. Non-greedy bodies so two spans on one line stay separate. */
const TOKEN = /(\*\*.+?\*\*|\*.+?\*|\[\[pill:[a-z]+\|.+?\]\]|\[\[prov:[cx]\]\]|\[\[src\|.+?\]\]|\n)/g;

function isPillTone(value: string): value is PlaybookPillTone {
  return (PILL_TONES as string[]).includes(value);
}

export function parsePlaybookInline(source: string): PlaybookInlineNode[] {
  const nodes: PlaybookInlineNode[] = [];
  for (const part of source.split(TOKEN)) {
    if (!part) continue;

    if (part === "\n") {
      nodes.push({ type: "break" });
    } else if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      nodes.push({ type: "strong", text: part.slice(2, -2) });
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      nodes.push({ type: "em", text: part.slice(1, -1) });
    } else if (part === "[[prov:c]]" || part === "[[prov:x]]") {
      nodes.push({ type: "prov", kind: part === "[[prov:c]]" ? "c" : "x" });
    } else if (part.startsWith("[[src|") && part.endsWith("]]")) {
      nodes.push({ type: "src", text: part.slice(6, -2) });
    } else if (part.startsWith("[[pill:") && part.endsWith("]]")) {
      const [tone, ...rest] = part.slice(7, -2).split("|");
      // An unknown tone falls back to the neutral pill rather than dropping the text.
      nodes.push({ type: "pill", tone: isPillTone(tone) ? tone : "a", text: rest.join("|") });
    } else {
      nodes.push({ type: "text", text: part });
    }
  }
  return nodes;
}
