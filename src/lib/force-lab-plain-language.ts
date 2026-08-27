/** Plain-English translations for the Force Lab Patient Report (see the print page's Patient
 *  Report tab) — turns clinical shorthand (normative-comparison codes, LSI percentages, exact
 *  muscle-group test names) into wording a patient with no medical background can read. Pure
 *  functions, no `server-only`: same reasoning as lib/force-lab-units.ts, whose
 *  getNormativeComparison/getLSIStatus outputs are exactly what plainNormativeComparison and
 *  plainLSILabel/plainLSIColor take as input, so this module deliberately mirrors those
 *  thresholds rather than redefining its own.
 */

export function plainNormativeComparison(comparison: string): string {
  const map: Record<string, string> = {
    above_norm: "Stronger than average for your age",
    within_norm: "In the normal range for your age",
    below_norm: "Slightly below average for your age",
    significantly_below: "Lower than most people your age — worth focusing on",
  };
  return map[comparison] ?? "";
}

export function plainLSILabel(lsi: number): string {
  if (lsi >= 95) return "Excellent symmetry";
  if (lsi >= 90) return "Good symmetry";
  if (lsi >= 80) return "Mild difference between sides";
  if (lsi >= 70) return "Moderate difference between sides";
  return "Significant difference between sides — focus area";
}

export function plainLSIColor(lsi: number): string {
  if (lsi >= 90) return "#16a34a";
  if (lsi >= 80) return "#c9853a";
  return "#dc2626";
}

// Muscle-group test names as ActiveForce/manual entry records them (e.g. "Hip Flexion —
// Seated") describe the testing position, which is clinically useful but reads as jargon to
// a patient — this maps each to what movement it actually measures. Falls back to the raw
// name for any muscle group not in this list (a norm this session's own bodyRegionForMuscle
// lookup already follows) rather than throwing, since new muscle groups get added to
// lib/force-lab-muscles.ts independently of this translation table.
const PLAIN_MUSCLE_GROUP_NAMES: Record<string, string> = {
  "Hip Flexion — Seated": "Hip Flexion",
  "Hip Extension — Prone": "Hip Extension",
  "Hip Abduction — Sidelying": "Hip Abduction",
  "Hip Adduction — Sidelying": "Hip Adduction",
  "Hip Internal Rotation": "Hip Rotation (Inward)",
  "Hip External Rotation": "Hip Rotation (Outward)",
  "Knee Extension — Seated": "Knee Straightening",
  "Knee Flexion — Prone": "Knee Bending",
  "Ankle Dorsiflexion": "Ankle Flexion (Upward)",
  "Ankle Plantarflexion": "Ankle Push-Off",
  "Ankle Inversion": "Ankle Inward Tilt",
  "Ankle Eversion": "Ankle Outward Tilt",
  "Shoulder Flexion": "Shoulder Lift (Forward)",
  "Shoulder Abduction": "Shoulder Lift (Sideways)",
  "Shoulder External Rotation": "Shoulder Rotation (Outward)",
  "Shoulder Internal Rotation": "Shoulder Rotation (Inward)",
  "Elbow Flexion": "Elbow Bending",
  "Elbow Extension": "Elbow Straightening",
  "Wrist Flexion": "Wrist Bending",
  "Wrist Extension": "Wrist Lifting",
  "Grip Strength": "Hand Grip",
  "Grip Strength — Pinch": "Pinch Grip",
};

export function plainMuscleGroupName(muscleGroup: string): string {
  return PLAIN_MUSCLE_GROUP_NAMES[muscleGroup] ?? muscleGroup;
}
