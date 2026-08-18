/**
 * The Therapeutic Exercise Library's content (see components/pro/TherapeuticExerciseLibrary
 * and /pro/exercises), shared with HepBuilder's "Add from library" picker — a HEP exercise
 * a clinician builds is the same shape (name, dosage, coaching cue) this library already
 * stores, so linking the two just means both reading from the one array here instead of
 * duplicating entries.
 */

export interface TherapeuticExercise {
  name: string;
  condition: string;
  region: string;
  setup: string;
  steps: string[];
  dosage: string;
  cue: string;
  pairsWith: string[];
}

export const REGIONS = ["All", "Spine", "Shoulder", "Hip", "Knee", "Ankle/Foot", "Neurological", "Geriatrics"] as const;

// Real, clinician-sourced entries only — no filler content here (unlike SpecialTestsLibrary/
// GuidelinesLibrary's "coming soon" scaffolding), since fabricating dosage/technique details
// for a clinical exercise library would be irresponsible. Grows one real entry at a time.
export const THERAPEUTIC_EXERCISES: TherapeuticExercise[] = [
  {
    name: "Thoracic Extension Exercise",
    condition: "Thoracic Kyphosis",
    region: "Spine",
    setup: "Sit upright in a chair with feet supported. Place both hands behind the head, elbows out.",
    steps: [
      "Gently draw the shoulder blades back and down.",
      "Extend the upper back over the back of the chair without forcing the neck backward.",
      "Hold 3–5 seconds.",
      "Return to neutral.",
    ],
    dosage: "10 reps × 2–3 sets",
    cue: "“Lift your breastbone toward the ceiling while keeping your ribs controlled—don’t arch from your low back.”",
    pairsWith: ["Scapular retraction", "Thoracic extension mobility work", "Pectoral stretching", "Cervical postural exercises"],
  },
];

/** Best-effort split of a dosage string like "10 reps × 2–3 sets" into HepExercise's
 *  separate reps/sets text fields — falls back to empty strings (the clinician fills them
 *  in by hand) rather than guessing when a future entry's dosage doesn't follow this exact
 *  "N reps × M sets" shape (e.g. a hold-based or time-based dosage). */
export function parseDosage(dosage: string): { reps: string; sets: string } {
  const match = dosage.match(/(\d+(?:[–-]\d+)?)\s*reps?\s*[×x]\s*(\d+(?:[–-]\d+)?)\s*sets?/i);
  if (!match) return { reps: "", sets: "" };
  return { reps: match[1], sets: match[2] };
}
