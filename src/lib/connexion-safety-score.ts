/** The Connexion Safety Score™ rubric — Delia Vicencio, PT, DPT's home safety/fall-risk
 *  assessment (see the "Connexion Safety Score Sheet" PDF this was transcribed from). Single
 *  source of truth for both the fillable form (app/actions/connexion-safety-score.ts,
 *  SafetyAssessmentForm.tsx) and the public marketing page (connexion/safety-score/page.tsx),
 *  so a domain/item/band never drifts between the two. Every item is scored 0 (No Risk) to 4
 *  (Critical Risk); each domain's max is item-count × 4, and they were designed to land on
 *  round numbers — 25 items × 4 = 100, 12 × 4 = 48, 15 × 4 = 60, total 208 — so don't add or
 *  remove an item without updating the paper form to match, and vice versa. */

export interface SafetyScoreItem {
  key: string;
  label: string;
}

export interface SafetyScoreSection {
  key: string;
  label: string;
  items: SafetyScoreItem[];
}

export interface SafetyScoreDomain {
  key: "environmental" | "mobility" | "fallRisk";
  name: string;
  sections: SafetyScoreSection[];
}

const ENTRYWAY: SafetyScoreItem[] = [
  { key: "entryPathwayClear", label: "Entry pathway clear" },
  { key: "entryLighting", label: "Adequate lighting" },
  { key: "stepsThresholdsSafe", label: "Steps/thresholds safe" },
  { key: "handrailAvailable", label: "Handrail available/secure" },
  { key: "doorwayNegotiable", label: "Doorway easy to negotiate" },
];

const LIVING_AREA: SafetyScoreItem[] = [
  { key: "walkwaysClear", label: "Walkways free of clutter" },
  { key: "throwRugsSecured", label: "Throw rugs secured/removed" },
  { key: "furnitureSafePassage", label: "Furniture allows safe passage" },
  { key: "cordsPositioned", label: "Electrical cords safely positioned" },
  { key: "livingLighting", label: "Adequate lighting/night lighting" },
];

const BATHROOM: SafetyScoreItem[] = [
  { key: "showerTubEntry", label: "Shower/tub entry safe" },
  { key: "grabBars", label: "Grab bars available/appropriate" },
  { key: "showerChair", label: "Shower chair/bench appropriate" },
  { key: "toiletTransferSafe", label: "Toilet transfer safe" },
  { key: "nonSlipSurface", label: "Non-slip surface" },
];

const BEDROOM_KITCHEN_STAIRS: SafetyScoreItem[] = [
  { key: "bedTransfer", label: "Bed transfer" },
  { key: "bedHeight", label: "Bed height" },
  { key: "bedToBathroomPath", label: "Path from bed to bathroom" },
  { key: "nightLighting", label: "Night lighting" },
  { key: "kitchenWorkAreas", label: "Kitchen work areas" },
  { key: "itemsWithinReach", label: "Frequently used items within safe reach" },
  { key: "stairwayLighting", label: "Stairway lighting" },
  { key: "stairHandrails", label: "Stair handrails" },
  { key: "stairCondition", label: "Stair condition" },
  { key: "negotiateStairs", label: "Ability to safely negotiate stairs" },
];

const MOBILITY_ITEMS: SafetyScoreItem[] = [
  { key: "sitStand", label: "Sit ↔ stand" },
  { key: "bedMobility", label: "Bed mobility" },
  { key: "toiletTransfer", label: "Toilet transfer" },
  { key: "showerTubTransfer", label: "Shower/tub transfer" },
  { key: "walkingIndoors", label: "Walking indoors" },
  { key: "walkingOutdoors", label: "Walking outdoors" },
  { key: "turningDirection", label: "Turning/changing direction" },
  { key: "negotiatingThresholds", label: "Negotiating thresholds" },
  { key: "stairs", label: "Stairs" },
  { key: "deviceUse", label: "Assistive device use" },
  { key: "footClearance", label: "Foot clearance" },
  { key: "balanceFunctional", label: "Balance during functional tasks" },
];

const FALL_RISK_ITEMS: SafetyScoreItem[] = [
  { key: "historyOfFalls", label: "History of falls" },
  { key: "nearFalls", label: "Near-falls/loss of balance" },
  { key: "lowerExtremityWeakness", label: "Lower-extremity weakness" },
  { key: "impairedBalance", label: "Impaired balance" },
  { key: "gaitAbnormality", label: "Gait abnormality" },
  { key: "difficultyTransfers", label: "Difficulty with transfers" },
  { key: "dizziness", label: "Dizziness/lightheadedness" },
  { key: "visualLimitations", label: "Visual limitations affecting mobility" },
  { key: "cognitiveConcerns", label: "Cognitive/safety-awareness concerns" },
  { key: "inconsistentDeviceUse", label: "Inappropriate/inconsistent device use" },
  { key: "fearOfFalling", label: "Fear of falling" },
  { key: "unsafeFootwear", label: "Unsafe footwear" },
  { key: "difficultyFollowingRecs", label: "Difficulty following safety recommendations" },
  { key: "limitedCaregiverSupport", label: "Limited caregiver support" },
  { key: "combinedRisks", label: "Environmental + mobility risks combined" },
];

export const SAFETY_SCORE_DOMAINS: SafetyScoreDomain[] = [
  {
    key: "environmental",
    name: "Environmental Safety",
    sections: [
      { key: "entryway", label: "Entryway", items: ENTRYWAY },
      { key: "livingArea", label: "Living Room / Hallways", items: LIVING_AREA },
      { key: "bathroom", label: "Bathroom", items: BATHROOM },
      { key: "bedroomKitchenStairs", label: "Bedroom / Kitchen / Stairs", items: BEDROOM_KITCHEN_STAIRS },
    ],
  },
  {
    key: "mobility",
    name: "Mobility & Functional Safety",
    sections: [{ key: "mobility", label: "", items: MOBILITY_ITEMS }],
  },
  {
    key: "fallRisk",
    name: "Fall-Risk Factors",
    sections: [{ key: "fallRisk", label: "", items: FALL_RISK_ITEMS }],
  },
];

export const RISK_SCALE: { score: 0 | 1 | 2 | 3 | 4; label: string; meaning: string }[] = [
  { score: 0, label: "No Risk", meaning: "Safe / no concern identified" },
  { score: 1, label: "Low Risk", meaning: "Minor concern; monitor or consider improvement" },
  { score: 2, label: "Moderate Risk", meaning: "Corrective action recommended" },
  { score: 3, label: "High Risk", meaning: "Significant safety concern; prioritize correction" },
  { score: 4, label: "Critical Risk", meaning: "Immediate attention/intervention recommended" },
];

export const EQUIPMENT_OPTIONS = ["Grab bar", "Shower chair/bench", "Raised toilet seat", "Walker / cane", "Handrail / ramp", "Night lights", "Other"];
export const EQUIPMENT_PRIORITIES = ["Routine", "Priority", "Urgent"] as const;
export type EquipmentPriority = (typeof EQUIPMENT_PRIORITIES)[number];

export interface EquipmentRecommendation {
  equipment: string;
  location: string;
  priority: EquipmentPriority;
}

export const CAREGIVER_SKILLS: SafetyScoreItem[] = [
  { key: "sitStandAssist", label: "Safe sit-to-stand assistance" },
  { key: "bedMobilityAssist", label: "Bed mobility assistance" },
  { key: "toiletTransferAssist", label: "Toilet transfer" },
  { key: "showerTransferAssist", label: "Shower transfer" },
  { key: "walkerAssist", label: "Walker/device assistance" },
  { key: "stairAssist", label: "Stair assistance" },
  { key: "fallResponse", label: "Fall-response procedure" },
  { key: "dailyMobilitySupport", label: "Daily mobility support" },
  { key: "homeExerciseProgram", label: "Home exercise/safety program" },
];

export type CaregiverSkillStatus = "demonstrated" | "needsTraining";

export const CRITICAL_FINDING_OPTIONS = [
  "Unsafe stairs without adequate support",
  "Unsafe shower/tub transfer",
  "Repeated recent falls",
  "Inability to safely transfer",
  "Significant wandering/safety concern",
  "Unsafe assistive-device use",
];

export const FOLLOW_UP_OPTIONS: { key: string; label: string }[] = [
  { key: "none", label: "No follow-up" },
  { key: "recheck", label: "Recheck home safety" },
  { key: "pt", label: "PT evaluation" },
  { key: "ot", label: "OT evaluation" },
  { key: "physician", label: "Physician/medical follow-up" },
  { key: "other", label: "Other" },
];

const RISK_BANDS: { max: number; level: string; action: string }[] = [
  { max: 40, level: "Low", action: "Continue current safety practices" },
  { max: 80, level: "Moderate", action: "Address identified risks" },
  { max: 120, level: "High", action: "Prioritize safety modifications" },
  { max: 160, level: "Very High", action: "Prompt intervention recommended" },
  { max: 208, level: "Critical", action: "Immediate safety action recommended" },
];

export function riskBandForScore(total: number): { max: number; level: string; action: string } {
  return RISK_BANDS.find((b) => total <= b.max) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

export function allSafetyScoreItems(): SafetyScoreItem[] {
  return SAFETY_SCORE_DOMAINS.flatMap((d) => d.sections.flatMap((s) => s.items));
}

export function domainMaxScore(domain: SafetyScoreDomain): number {
  return domain.sections.reduce((sum, s) => sum + s.items.length, 0) * 4;
}

function domainScore(domain: SafetyScoreDomain, scores: Record<string, number>): number {
  return domain.sections.reduce((sum, s) => sum + s.items.reduce((a, item) => a + (scores[item.key] ?? 0), 0), 0);
}

export interface SafetyScoreTotals {
  environmental: number;
  mobility: number;
  fallRisk: number;
  total: number;
  riskLevel: string;
  riskAction: string;
}

export function computeSafetyScoreTotals(scores: Record<string, number>): SafetyScoreTotals {
  const environmental = domainScore(SAFETY_SCORE_DOMAINS[0], scores);
  const mobility = domainScore(SAFETY_SCORE_DOMAINS[1], scores);
  const fallRisk = domainScore(SAFETY_SCORE_DOMAINS[2], scores);
  const total = environmental + mobility + fallRisk;
  const band = riskBandForScore(total);
  return { environmental, mobility, fallRisk, total, riskLevel: band.level, riskAction: band.action };
}
