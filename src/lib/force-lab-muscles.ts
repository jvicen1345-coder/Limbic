/** Shared fixed muscle-group list for Limbic Force Lab (/pro/force-lab) — one place both
 *  the server actions (app/actions/force-lab.ts, for validation) and the form components
 *  (components/pro/force-lab/*) read from, same "single source of truth" reasoning as
 *  BODY_REGIONS in lib/clinician-dashboard-types.ts. No `server-only` import — the manual
 *  entry form's two-level body-region-then-muscle select needs this in the browser too.
 */

export const muscleGroups: Record<string, string[]> = {
  Hip: [
    "Hip Flexion — Seated",
    "Hip Extension — Prone",
    "Hip Abduction — Sidelying",
    "Hip Adduction — Sidelying",
    "Hip Internal Rotation",
    "Hip External Rotation",
  ],
  Knee: ["Knee Extension — Seated", "Knee Flexion — Prone"],
  Ankle: ["Ankle Dorsiflexion", "Ankle Plantarflexion", "Ankle Inversion", "Ankle Eversion"],
  Shoulder: ["Shoulder Flexion", "Shoulder Abduction", "Shoulder External Rotation", "Shoulder Internal Rotation"],
  Elbow: ["Elbow Flexion", "Elbow Extension"],
  Wrist: ["Wrist Flexion", "Wrist Extension"],
  Grip: ["Grip Strength"],
};

export const bodyRegions = Object.keys(muscleGroups);

export const allMuscleGroups = Object.entries(muscleGroups).flatMap(([region, muscles]) =>
  muscles.map((muscle) => ({ region, muscle }))
);

/** Body region for a given muscle group name — used wherever only the muscle group is on
 *  hand (e.g. a saved ForceLabSession) and the region needs re-deriving for a filter or
 *  norm lookup, rather than trusting a second stored copy to stay in sync. */
export function bodyRegionForMuscle(muscleGroup: string): string | null {
  return allMuscleGroups.find((m) => m.muscle === muscleGroup)?.region ?? null;
}
