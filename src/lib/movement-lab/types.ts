/**
 * Limbic Movement Lab — the shared shape every exercise in the bank is stored in.
 *
 * This is deliberately a much richer record than the THERAPEUTIC_EXERCISES shape it replaces
 * (name / condition / region / setup / steps / dosage / cue / pairsWith), because the
 * Movement Lab has to serve three readers at once and that thinner shape only served one:
 *
 *   1. A clinician browsing for the right exercise — needs region, category, position,
 *      equipment, rehab phase and difficulty to filter on, not just a body region.
 *   2. The HEP Builder's "Add from Movement Lab" picker — needs a dosage it can split into
 *      the builder's separate sets/reps fields, plus a patient-facing line for `notes`.
 *   3. The patient who ends up holding the printout — needs `patientInstructions`, one
 *      plain-language paragraph written at a reading level a handout can actually use,
 *      rather than the clinical `steps` array written for the person prescribing it.
 *
 * The content discipline is the one the old therapeutic-exercises library set and
 * lib/coursework-hep-templates.ts restates: every entry here is a widely-taught, standard-of-
 * care movement whose setup, technique and typical dosage can be stated responsibly
 * without inventing a citation. Dosage is written as a *typical starting range*, never a
 * single invented precise number, and `precautions` carries the "this is where the real
 * protocol overrides me" caveats. No entry carries a video URL: linking a demonstration
 * would mean guessing at a URL nobody verified (see exercises-static.ts, which only links
 * videos that were actually checked before shipping), and a wrong link on a clinical
 * exercise is worse than no link.
 */

/** Body region a clinician would filter by when they already know what they're treating.
 *  Finer-grained than the old library's single "Spine" bucket — it splits the spine into its
 *  three clinically distinct pieces (a cervical deep-neck-flexor hold and a lumbar dead bug
 *  have nothing to do with each other) and gives the upper limb its own region. */
export const MOVEMENT_REGIONS = [
  "Cervical",
  "Thoracic & Rib",
  "Lumbar & Core",
  "Shoulder",
  "Elbow, Wrist & Hand",
  "Hip & Pelvis",
  "Knee",
  "Ankle & Foot",
  "Neuro & Balance",
  "General Conditioning",
] as const;
export type MovementRegion = (typeof MOVEMENT_REGIONS)[number];

/** What the exercise is *for*, which is the second question after "what body part" and the
 *  one that decides whether it belongs in this patient's program today. A joint can be
 *  stiff, weak, uncoordinated or unstable and each needs a different pick. */
export const MOVEMENT_CATEGORIES = [
  "Mobility",
  "Flexibility",
  "Activation",
  "Strength",
  "Motor Control",
  "Neurodynamic",
  "Balance",
  "Power & Plyometric",
  "Endurance",
] as const;
export type MovementCategory = (typeof MOVEMENT_CATEGORIES)[number];

/** Starting position. Filterable because it is often the binding constraint on a real HEP —
 *  a patient who can't get to the floor rules out every prone and quadruped entry at once,
 *  and finding that out by reading 160 setups one at a time is the problem this solves. */
export const MOVEMENT_POSITIONS = [
  "Supine",
  "Prone",
  "Sidelying",
  "Seated",
  "Quadruped",
  "Half-kneeling",
  "Kneeling",
  "Standing",
] as const;
export type MovementPosition = (typeof MOVEMENT_POSITIONS)[number];

/** What the patient has to own to do it at home. "None" is its own value and is the single
 *  most-used filter in the browser for exactly that reason — a program built out of
 *  equipment the patient doesn't have is a program that doesn't get done.
 *
 *  Ordered as two groups: training implements a patient buys (band through rope), then the
 *  household objects and surfaces most people already have (chair through table). "Rope"
 *  covers battle ropes and any anchored heavy rope. Gym kit with no value of its own —
 *  a barbell, a landmine, a machine — is filed under the nearest implement here and named
 *  in the exercise's own `setup`; deliberately keep this list short enough to scan in a
 *  dropdown rather than growing a value per piece of equipment. Never file real kit under
 *  "None": that value is a promise the patient needs nothing. */
export const MOVEMENT_EQUIPMENT = [
  "None",
  "Resistance band",
  "Weight",
  "Ball",
  "Foam roller",
  "Rope",
  "Chair",
  "Step or stairs",
  "Towel or strap",
  "Wall",
  "Cane or dowel",
  "Table or counter",
] as const;
export type MovementEquipment = (typeof MOVEMENT_EQUIPMENT)[number];

/** Where in a course of care the exercise usually earns its place. An exercise can belong
 *  to more than one phase (a glute bridge is both an early activation drill and a later
 *  loaded strength exercise), which is why this is an array, not a single stage. */
export const REHAB_PHASES = [
  "Acute / Protected",
  "Subacute / Restore",
  "Strengthening",
  "Return to Activity",
] as const;
export type RehabPhase = (typeof REHAB_PHASES)[number];

/** 1 = a patient in the first days after injury or surgery can usually do it; 5 = demands
 *  full strength, load tolerance and control, i.e. the end of a return-to-sport progression.
 *  A blunt integer on purpose — it exists to sort and filter a long list, not to be a
 *  validated scale, and nothing clinical should be decided on it alone. */
export type MovementDifficulty = 1 | 2 | 3 | 4 | 5;

/** Split into fields rather than left as one string so the HEP Builder can drop `sets` and
 *  `reps` straight into its own separate inputs — the old therapeutic-exercises library
 *  stored one combined "10 reps × 2–3 sets" string that its parseDosage helper had to regex
 *  back apart, and that silently returned empty fields for anything hold- or time-based.
 *  Storing the pieces separately makes that failure mode impossible. Every value is a typical starting range; the
 *  prescribing clinician sets the real number. */
export interface MovementDosage {
  /** e.g. "2–3". "1" for a single set. */
  sets: string;
  /** e.g. "10–15", or "8 each side". Empty when the exercise is purely hold- or
   *  time-based and a rep count would be meaningless. */
  reps: string;
  /** e.g. "5 s", "30–45 s". Omitted when there is no hold. */
  hold?: string;
  /** e.g. "Daily", "1–2x/day", "Every other day". */
  frequency: string;
  /** Tempo, load or range guidance that doesn't fit the fields above — e.g. "3 s lowering
   *  phase", "load that makes the last 2 reps hard". Omitted when there's nothing to say. */
  loadOrTempo?: string;
}

export interface MovementExercise {
  /** Stable kebab-case slug. Used as the React key, the deep-link hash on the browse page,
   *  and — most importantly — the reference protocols point at (see protocols.ts), so
   *  renaming one silently breaks every protocol that uses it. Treat as permanent. */
  id: string;
  name: string;
  /** Other names the same movement is taught under, so a clinician searching the term they
   *  learned finds it. Searched alongside `name`. */
  aka?: string[];
  region: MovementRegion;
  category: MovementCategory;
  positions: MovementPosition[];
  equipment: MovementEquipment[];
  difficulty: MovementDifficulty;
  phases: RehabPhase[];
  /** Muscles or tissues the exercise is aimed at, in plain clinical language. */
  targets: string[];
  /** Presentations this is commonly prescribed for. Not a diagnosis list and not exhaustive
   *  — it's what makes the exercise findable when a clinician searches by condition. */
  indications: string[];
  setup: string;
  steps: string[];
  dosage: MovementDosage;
  /** The one sentence you'd actually say out loud to the patient. Quoted, patient-facing. */
  cue: string;
  /** Plain-language paragraph for the printed handout — what the patient reads at home with
   *  nobody there to interpret it. No abbreviations, no anatomy the patient doesn't need. */
  patientInstructions: string;
  commonErrors: string[];
  /** What to give instead when this one is still too much. */
  regression: string;
  /** The next step up once this one is easy. */
  progression: string;
  /** When to hold off, and which real-world protocol overrides this entry. Every entry has
   *  at least one — an exercise with no stated limits is an exercise nobody double-checked. */
  precautions: string[];
  /** Where the movement comes from when it comes from a specific named, widely-published
   *  programme (Alfredson, Otago, McKenzie, Sahrmann and so on). Left off entirely rather
   *  than attributing a generic exercise to a source that didn't originate it. */
  note?: string;
}

/**
 * "2–3 sets × 10–15 · hold 5 s · Daily" — one line for a card, built from whichever fields
 * are actually present so a hold-only or rep-only entry reads correctly instead of rendering
 * an empty "× reps".
 *
 * Two singular cases are handled because both occur in the bank and both read as bugs when
 * they aren't: a single set ("1 set", not "1 sets"), and a hold-based entry whose rep count
 * is one, where "× 1" adds nothing over the hold that follows it.
 */
export function formatDosage(d: MovementDosage): string {
  const parts: string[] = [];
  const setsLabel = `${d.sets} ${d.sets === "1" ? "set" : "sets"}`;
  parts.push(d.reps && d.reps !== "1" ? `${setsLabel} × ${d.reps}` : setsLabel);
  if (d.hold) parts.push(`hold ${d.hold}`);
  if (d.loadOrTempo) parts.push(d.loadOrTempo);
  parts.push(d.frequency);
  return parts.join(" · ");
}
