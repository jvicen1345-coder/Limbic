/** Shared pure-function utilities for Limbic Force Lab (/pro/force-lab) — unit conversion,
 *  LSI/difference/percent-difference math, and status classification. No `server-only`
 *  import: the manual-entry form calls these client-side for its live-updating calculated
 *  values, and app/actions/force-lab.ts calls the same functions server-side before saving
 *  a session, so the two can never compute a different answer for the same inputs.
 */

// Fixed, non-theme-adaptive colors per Force Lab's own visual rules — deliberately not the
// app's --color-success/--color-danger tokens (which shift between light/dark mode), since
// the spec calls for these exact hex values "always", the same everywhere they appear:
// LSI/normative-comparison status pills, the strength-profile bars, and the right/left
// trend-chart lines. FORCE_LAB_LEFT and FORCE_LAB_AMBER are the same literal value on
// purpose — "left side" and "caution" happen to share one hex in the spec.
export const FORCE_LAB_GREEN = "#16a34a";
export const FORCE_LAB_AMBER = "#c9853a";
export const FORCE_LAB_RED = "#dc2626";
export const FORCE_LAB_LEFT = FORCE_LAB_AMBER;

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function convertForDisplay(value: number, storedUnit: string, displayUnit: string): number {
  if (storedUnit === displayUnit) return value;
  if (storedUnit === "lbs" && displayUnit === "kg") return lbsToKg(value);
  if (storedUnit === "kg" && displayUnit === "lbs") return kgToLbs(value);
  return value;
}

/** Limb Symmetry Index — involved side as a percentage of the uninvolved side. Which side
 *  is "involved" is a clinical judgment call the form itself doesn't try to make (see
 *  ForceMeasurementsSection.tsx) — right and left are passed in whichever order the caller
 *  already knows is involved/uninvolved. */
export function calculateLSI(involved: number, uninvolved: number): number {
  if (uninvolved === 0) return 0;
  return Math.round((involved / uninvolved) * 100 * 10) / 10;
}

export function calculateDifference(right: number, left: number): number {
  return Math.round(Math.abs(right - left) * 10) / 10;
}

export function calculatePercentDiff(right: number, left: number): number {
  const larger = Math.max(right, left);
  if (larger === 0) return 0;
  return Math.round((Math.abs(right - left) / larger) * 100 * 10) / 10;
}

export function getLSIStatus(lsi: number): "normal" | "caution" | "deficit" {
  if (lsi >= 90) return "normal";
  if (lsi >= 80) return "caution";
  return "deficit";
}

export function getNormativeComparison(value: number, mean: number, sd: number): string {
  const zScore = (value - mean) / sd;
  if (zScore >= 0) return "above_norm";
  if (zScore >= -1) return "within_norm";
  if (zScore >= -2) return "below_norm";
  return "significantly_below";
}
