import { MESH_CLINICAL_TERMS } from "./mesh-terms";

/**
 * Clinical relevance scores for article tags and keywords.
 * Only tags scoring 3 or above appear as gap topics in the
 * Limbic Agent Preview Card. Everything below is filtered out.
 *
 * 5 — Core specialty (always clinically relevant)
 * 4 — Clinical sub-topic (specific condition or body region)
 * 3 — Anatomy or condition adjacent (still clinical)
 * 2 — Clinical adjacent (professional but not clinical)
 * 1 — Non-clinical (policy, legal, general)
 *
 * This dictionary is hand-maintained for terms that need a specific grade (e.g.
 * distinguishing a core specialty from an anatomy-adjacent term). Tags that aren't
 * listed here but do appear in mesh-terms.ts — real NLM MeSH descriptors from PT/rehab
 * tree branches (see scripts/fetch-mesh-terms.mjs) — are treated as clinical sub-topics
 * (score 4) rather than falling through to the generic "clinical adjacent" default.
 */
export const CLINICAL_RELEVANCE_SCORES: Record<string, number> = {
  // Core specialties — 5
  orthopedic: 5,
  orthopaedic: 5,
  neurological: 5,
  neurologic: 5,
  sports: 5,
  pediatric: 5,
  paediatric: 5,
  geriatric: 5,
  vestibular: 5,
  // Clinical sub-topics — 4
  knee: 4,
  shoulder: 4,
  hip: 4,
  spine: 4,
  lumbar: 4,
  cervical: 4,
  thoracic: 4,
  acl: 4,
  fracture: 4,
  stroke: 4,
  concussion: 4,
  balance: 4,
  gait: 4,
  "fall risk": 4,
  "falls prevention": 4,
  "cerebral palsy": 4,
  parkinson: 4,
  "multiple sclerosis": 4,
  "spinal cord": 4,
  "brain injury": 4,
  "rotator cuff": 4,
  "back pain": 4,
  joint: 4,
  patellofemoral: 4,
  tendinopathy: 4,
  "plantar fasciitis": 4,
  // Anatomy and condition adjacent — 3
  muscle: 3,
  tendon: 3,
  ligament: 3,
  cartilage: 3,
  nerve: 3,
  "range of motion": 3,
  strength: 3,
  mobility: 3,
  flexibility: 3,
  posture: 3,
  "manual therapy": 3,
  "exercise therapy": 3,
  rehabilitation: 3,
  recovery: 3,
  pain: 3,
  inflammation: 3,
  "dry needling": 3,
  ultrasound: 3,
  "electrical stimulation": 3,
  // Clinical adjacent — 2 (filtered from gap topics)
  athlete: 2,
  athletic: 2,
  research: 2,
  study: 2,
  trial: 2,
  evidence: 2,
  guideline: 2,
  protocol: 2,
  outcomes: 2,
  "return to sport": 2,
  "return to play": 2,
  // Non-clinical — 1 (always filtered from gap topics)
  legislation: 1,
  law: 1,
  policy: 1,
  cms: 1,
  medicare: 1,
  medicaid: 1,
  reimbursement: 1,
  insurance: 1,
  payer: 1,
  regulation: 1,
  device: 1,
  wearable: 1,
  software: 1,
  app: 1,
  equipment: 1,
};

/** Minimum score for a tag to appear as a gap topic */
export const GAP_TOPIC_MIN_SCORE = 3;

/** Returns the clinical relevance score for a tag */
export function clinicalRelevanceScore(tag: string): number {
  const lower = tag.toLowerCase();
  if (lower in CLINICAL_RELEVANCE_SCORES) return CLINICAL_RELEVANCE_SCORES[lower];
  if (MESH_CLINICAL_TERMS.has(lower)) return 4;
  return 2;
}

/** Returns true if a tag is clinically relevant enough to appear as a gap topic */
export function isClinicalGapTopic(tag: string): boolean {
  return clinicalRelevanceScore(tag) >= GAP_TOPIC_MIN_SCORE;
}

/**
 * Canonical forms for tags that appear as near-duplicates
 * due to keyword variation — athlete/athletic,
 * orthopedic/orthopaedic etc.
 * Normalized before scoring so duplicates never both appear.
 */
export const TAG_NORMALIZATIONS: Record<string, string> = {
  orthopaedic: "orthopedic",
  paediatric: "pediatric",
  athletic: "athlete",
  neurological: "neurologic",
  "fall risk": "falls prevention",
  "return to play": "return to sport",
};

/** Returns the canonical form of a tag */
export function normalizeTag(tag: string): string {
  const lower = tag.toLowerCase();
  return TAG_NORMALIZATIONS[lower] ?? lower;
}

/**
 * Normalizes and deduplicates an array of tags,
 * then filters to only clinically relevant ones
 * above the gap topic threshold.
 */
export function filterClinicalGapTopics(tags: string[]): string[] {
  const normalized = tags.map(normalizeTag);
  const deduplicated = Array.from(new Set(normalized));
  return deduplicated.filter(isClinicalGapTopic);
}
