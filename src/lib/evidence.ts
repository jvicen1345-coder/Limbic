import type { ArticleType, EvidenceLevel } from "@/lib/types";

/** Generic type -> evidence level, for every source except PubMed (which gets its own
 *  specific RCT/SR/MA/Review from real structured metadata — see lib/pubmed.ts). Applied
 *  as a fallback in lib/articles.ts's normalization pass and lib/saved-snapshot.ts, so
 *  every article ends up with a level without hand-editing every static seed file. */
export function defaultEvidenceLevelForType(type: ArticleType): EvidenceLevel {
  switch (type) {
    case "guideline":
      return "CPG";
    case "industry":
      return "Industry";
    case "ce":
      return "CE";
    case "product":
      return "Product";
    case "research":
      return "Research";
  }
}

export interface EvidenceLevelMeta {
  /** 2-4 letter abbreviation shown on the compact card badge. */
  shortLabel: string;
  /** Full name — the hover tooltip, and the detail page's larger badge. */
  label: string;
  /** One hardcoded sentence explaining what the level means — shown under the badge on
   *  the article detail page. No API call, no generation — same "never fabricate,
   *  always real" spirit as this app's other evidence-adjacent content. */
  description: string;
  /** CSS class for the pill's color — see the .tag-evidence-* rules in globals.css. */
  className: string;
}

export const EVIDENCE_LEVEL_META: Record<EvidenceLevel, EvidenceLevelMeta> = {
  RCT: {
    shortLabel: "RCT",
    label: "Randomized Controlled Trial",
    description: "The highest level of primary research evidence — randomly assigned groups minimize bias.",
    className: "tag-evidence-rct",
  },
  SR: {
    shortLabel: "SR",
    label: "Systematic Review",
    description: "Synthesizes findings across multiple studies on the same clinical question, following a defined method.",
    className: "tag-evidence-sr",
  },
  MA: {
    shortLabel: "MA",
    label: "Meta-Analysis",
    description: "Statistically combines results from multiple studies for a more precise, pooled estimate.",
    className: "tag-evidence-ma",
  },
  Review: {
    shortLabel: "REV",
    label: "Review Article",
    description: "A narrative or scoping summary of existing literature, not a systematic synthesis.",
    className: "tag-evidence-review",
  },
  Research: {
    shortLabel: "RES",
    label: "Research Study",
    description: "A primary research study — its specific design isn't identified in the available source data.",
    className: "tag-evidence-research",
  },
  CPG: {
    shortLabel: "CPG",
    label: "Clinical Practice Guideline",
    description: "A formal, evidence-based clinical practice guideline from a professional body.",
    className: "tag-evidence-cpg",
  },
  Industry: {
    shortLabel: "IND",
    label: "Industry & Policy",
    description: "Industry, reimbursement, or regulatory news — not primary research or clinical guidance.",
    className: "tag-evidence-industry",
  },
  CE: {
    shortLabel: "CE",
    label: "Continuing Education",
    description: "A continuing education course, conference, or event listing.",
    className: "tag-evidence-ce",
  },
  Product: {
    shortLabel: "PRD",
    label: "Product & Equipment",
    description: "Equipment or product news — not primary research or clinical guidance.",
    className: "tag-evidence-product",
  },
};
