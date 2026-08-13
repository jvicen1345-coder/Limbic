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
  /** One hardcoded, short line explaining what the level means — shown under the hero
   *  evidence badge on the article detail page (see components/ArticleReadingPane.tsx). No
   *  API call, no generation — same "never fabricate, always real" spirit as this app's
   *  other evidence-adjacent content. */
  description: string;
  /** CSS class for the pill's color — see the .tag-evidence-* rules in globals.css. */
  className: string;
}

export const EVIDENCE_LEVEL_META: Record<EvidenceLevel, EvidenceLevelMeta> = {
  RCT: {
    shortLabel: "RCT",
    label: "Randomized Controlled Trial",
    description: "Randomized Controlled Trial, highest level of primary evidence",
    className: "tag-evidence-rct",
  },
  SR: {
    shortLabel: "SR",
    label: "Systematic Review",
    description: "Systematic Review, synthesizes multiple studies",
    className: "tag-evidence-sr",
  },
  MA: {
    shortLabel: "MA",
    label: "Meta-Analysis",
    description: "Meta-Analysis, statistical combination of multiple studies",
    className: "tag-evidence-ma",
  },
  Review: {
    shortLabel: "REV",
    label: "Review Article",
    description: "Review Article, summarizes existing literature",
    className: "tag-evidence-review",
  },
  Research: {
    shortLabel: "RES",
    label: "Research Study",
    description: "Primary research study",
    className: "tag-evidence-research",
  },
  CPG: {
    shortLabel: "CPG",
    label: "Clinical Practice Guideline",
    description: "Clinical Practice Guideline",
    className: "tag-evidence-cpg",
  },
  Industry: {
    shortLabel: "IND",
    label: "Industry & Policy",
    description: "Industry or policy news",
    className: "tag-evidence-industry",
  },
  CE: {
    shortLabel: "CE",
    label: "Continuing Education",
    description: "Continuing education course, conference, or event listing",
    className: "tag-evidence-ce",
  },
  Product: {
    shortLabel: "PRD",
    label: "Product & Equipment",
    description: "Equipment or product news",
    className: "tag-evidence-product",
  },
};
