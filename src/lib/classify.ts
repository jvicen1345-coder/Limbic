import type { ArticleType, Specialty } from "@/lib/types";

/**
 * Keyword-based classification for live-sourced articles (PubMed research, Google News
 * industry/product) — see lib/pubmed.ts and lib/news-live.ts, both of which call classify()
 * from here. Pulled into its own module (no "server-only") because it's pure text
 * classification with no I/O, unlike the fetch/parsing code that surrounds its two callers —
 * keeping it free of "server-only" is what lets a plain unit test import it directly (see
 * e2e/classify.spec.ts) instead of needing a running server.
 */

const SPECIALTY_KEYWORDS: Record<Specialty, string[]> = {
  ortho: ["orthopedic", "orthopaedic", "knee", "hip", "spine", "joint", "acl", "fracture", "shoulder", "back pain"],
  neuro: ["stroke", "neurologic", "neurological", "vestibular", "parkinson", "brain injury", "multiple sclerosis", "spinal cord"],
  cardiopulm: ["cardiopulmonary", "cardiac rehab", "cardiac rehabilitation", "pulmonary rehab", "pulmonary rehabilitation", "copd", "heart failure", "pulmonary disease", "icu mobility", "post-covid"],
  sports: ["sports", "athlete", "athletic", "concussion", "return to play", "return-to-sport", "ncaa", "combine"],
  pediatric: ["pediatric", "paediatric", "children", "child", "infant", "cerebral palsy", "toddler"],
  geriatric: ["geriatric", "older adult", "elderly", "senior", "fall risk", "falls prevention", "aging"],
};

const TYPE_KEYWORDS: Record<ArticleType, string[]> = {
  research: ["study", "trial", "researchers", "journal", "randomized", "cohort", "findings"],
  // Empty on purpose: "Guidelines" now means the real, curated AOPT clinical practice
  // guidelines in lib/orthopt-cpg-static.ts, not a keyword guess off general news search —
  // see lib/articles.ts. An empty keyword list means classify() can never award a Google
  // News result "guideline" as its best-match type.
  guideline: [],
  industry: ["cms", "medicare", "medicaid", "reimbursement", "policy", "legislation", "law", "insurer", "payer", "regulation"],
  ce: ["webinar", "conference", "continuing education", "ce credit", "course", "csm", "symposium"],
  product: ["device", "wearable", "equipment", "fda clearance", "fda-cleared", "launch", "software", "app"],
};

/** Specific exercise interventions and treatment techniques a study investigated — distinct
 *  from SPECIALTY_KEYWORDS (body region/population) and TYPE_KEYWORDS (research vs. industry
 *  vs. CE, etc.). Unlike those two, this isn't a single-winner competition: a real trial
 *  routinely combines several (e.g. "blood flow restriction" + "resistance training"), so
 *  every match found is kept as its own tag rather than just the best-scoring one.
 *
 *  Added because classify() previously had no way to surface *what* a study actually tested —
 *  only its body-region specialty and evidence type — so "show me new exercise/technique
 *  research" had no tag to filter or follow, even though PubMed's own MeSH query (see
 *  DEFAULT_QUERY in lib/pubmed.ts) already retrieves that research: "Physical Therapy
 *  Modalities"[MeSH] explodes to include "Exercise Therapy"[MeSH] and similar narrower terms,
 *  and a live check against E-utilities found 20k+ matching RCTs already in the fetched pool.
 *  The gap was downstream tagging, not the underlying search. */
const TECHNIQUE_KEYWORDS = [
  "exercise therapy",
  "therapeutic exercise",
  "resistance training",
  "strength training",
  "aerobic exercise",
  "aquatic therapy",
  "manual therapy",
  "dry needling",
  "blood flow restriction",
  "neuromuscular training",
  "eccentric training",
  "isokinetic",
  "telerehabilitation",
  "virtual reality",
  "gait training",
  "balance training",
  "electrical stimulation",
  "myofascial release",
  "kinesiology tape",
  "high-intensity interval training",
];

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A handful of keyword literals are acronyms that title-casing mangles ("Cms" instead of
 *  "CMS"), or are spelling variants of the same thing ("fda clearance" / "fda-cleared") —
 *  normalized here so they don't show up as separate near-duplicate topic chips. */
const KEYWORD_LABEL_OVERRIDES: Record<string, string> = {
  cms: "CMS",
  ncaa: "NCAA",
  csm: "CSM",
  acl: "ACL",
  "fda clearance": "FDA Clearance",
  "fda-cleared": "FDA Clearance",
};

/** Keywords that just restate the specialty/type label already guaranteed to be on the
 *  article (SPECIALTY_META / TYPE_META add that label separately, unconditionally) —
 *  not useful as a distinct followable topic, so dropped rather than kept as a duplicate. */
const SUPPRESSED_KEYWORDS = new Set([
  "pediatric",
  "paediatric",
  "geriatric",
  "sports",
  "neurologic",
  "neurological",
  "orthopedic",
  "orthopaedic",
  "guideline",
  "equipment",
]);

/** Returns the display label for a matched keyword, or null if it should be dropped —
 *  see SUPPRESSED_KEYWORDS and KEYWORD_LABEL_OVERRIDES above. */
function keywordLabel(kw: string): string | null {
  const lower = kw.toLowerCase();
  if (SUPPRESSED_KEYWORDS.has(lower)) return null;
  return KEYWORD_LABEL_OVERRIDES[lower] ?? titleCase(kw);
}

export function classify(
  text: string,
  defaultType: ArticleType
): { type: ArticleType; specialty: Specialty; matchedKeywords: string[]; typeConfident: boolean } {
  const lower = text.toLowerCase();
  let bestSpecialty: Specialty = "ortho";
  let bestSpecialtyHits = 0;
  let bestSpecialtyKeywords: string[] = [];
  (Object.keys(SPECIALTY_KEYWORDS) as Specialty[]).forEach((sp) => {
    const matched = SPECIALTY_KEYWORDS[sp].filter((kw) => lower.includes(kw));
    if (matched.length > bestSpecialtyHits) {
      bestSpecialtyHits = matched.length;
      bestSpecialty = sp;
      // Every keyword that matched the winning specialty, not just the first — a followed
      // topic like "ACL" or "fall risk" only ever affects ranking (see rankFeed) if it
      // actually ends up in the article's tags, so a single kept keyword per article made
      // most of the long-tail topic list effectively inert.
      bestSpecialtyKeywords = matched;
    }
  });

  let type = defaultType;
  let bestTypeHits = 0;
  let bestTypeKeywords: string[] = [];
  (Object.keys(TYPE_KEYWORDS) as ArticleType[]).forEach((t) => {
    const matched = TYPE_KEYWORDS[t].filter((kw) => lower.includes(kw));
    if (matched.length > bestTypeHits) {
      bestTypeHits = matched.length;
      type = t;
      bestTypeKeywords = matched;
    }
  });

  const matchedTechniqueKeywords = TECHNIQUE_KEYWORDS.filter((kw) => lower.includes(kw));

  const matchedKeywords = [...bestSpecialtyKeywords, ...bestTypeKeywords, ...matchedTechniqueKeywords]
    .map(keywordLabel)
    .filter((k): k is string => k !== null);
  return { type, specialty: bestSpecialty, matchedKeywords, typeConfident: bestTypeHits > 0 };
}

/** Every keyword-derived topic label classify() can ever produce, normalized the same way
 *  and deduplicated — independent of which articles happen to be loaded right now. Used to
 *  populate Profile's "Add more" topic list so it doesn't shrink or grow as live sources
 *  refresh (classify() only keeps the first-matched keyword per specialty/type per article,
 *  so plenty of these never win that slot for any currently-loaded article, and would
 *  otherwise never appear as a followable topic at all). */
export function allKnownKeywordTopics(): string[] {
  const allKeywords = [...Object.values(SPECIALTY_KEYWORDS).flat(), ...Object.values(TYPE_KEYWORDS).flat(), ...TECHNIQUE_KEYWORDS];
  const labels = allKeywords.map(keywordLabel).filter((k): k is string => k !== null);
  return Array.from(new Set(labels)).sort();
}
