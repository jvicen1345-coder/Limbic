/**
 * The fixed body-part categories the /hep template library panel groups saved templates
 * under (see components/HepTemplateLibrary.tsx). A separate, purpose-built list from
 * lib/movement-lab's MOVEMENT_REGIONS — that one drives the exercise bank's own filters and
 * doesn't line up with what a clinician actually organizes whole HEP templates by (e.g.
 * "Post-Surgical" and "General Conditioning" aren't exercise regions, they're program
 * categories). MovementProtocol maps itself onto this list, via its `bodyPart` field, for
 * exactly that reason — see lib/movement-lab/protocols.ts.
 */
export const HEP_TEMPLATE_BODY_PARTS = [
  "Spine",
  "Shoulder",
  "Elbow and Wrist",
  "Hip",
  "Knee",
  "Ankle and Foot",
  "Neurological",
  "Post-Surgical",
  "General Conditioning",
] as const;

export type HepTemplateBodyPart = (typeof HEP_TEMPLATE_BODY_PARTS)[number];

export function isHepTemplateBodyPart(value: string): value is HepTemplateBodyPart {
  return (HEP_TEMPLATE_BODY_PARTS as readonly string[]).includes(value);
}

// Shown in muted text next to a category name to clarify the sub-regions it covers — only
// Spine needs this, the other eight are self-explanatory.
export const HEP_TEMPLATE_BODY_PART_NOTE: Partial<Record<HepTemplateBodyPart, string>> = {
  Spine: "Cervical, Thoracic, Lumbar",
};

// What a saved HEPTemplate is *for* — a take-home program the patient does on their own
// (the only kind that existed before this field) vs. a circuit the clinician runs with the
// patient in clinic. Orthogonal to HEP_TEMPLATE_BODY_PARTS above (a body part describes what
// the exercises target; a kind describes who does them and where) — the /hep page's template
// library groups by body part within whichever kind is selected, not the other way around.
export const HEP_TEMPLATE_KINDS = ["home", "clinic"] as const;

export type HepTemplateKind = (typeof HEP_TEMPLATE_KINDS)[number];

export function isHepTemplateKind(value: string): value is HepTemplateKind {
  return (HEP_TEMPLATE_KINDS as readonly string[]).includes(value);
}

export const HEP_TEMPLATE_KIND_LABELS: Record<HepTemplateKind, string> = {
  home: "Home Program",
  clinic: "In-Clinic Program",
};

// Shorter form for the template library panel's kind tabs (HepTemplateLibrary.tsx) — that
// panel is a fixed 280px column (see .hep-template-panel in globals.css), too narrow for
// both full HEP_TEMPLATE_KIND_LABELS side by side without clipping.
export const HEP_TEMPLATE_KIND_SHORT_LABELS: Record<HepTemplateKind, string> = {
  home: "Home",
  clinic: "In-Clinic",
};

// What actually gets persisted as HEPTemplate.exercises, PatientHEPAssignment.exercises, and
// SessionExerciseLog.exercises (see each model's own comment in schema.prisma) — read/written
// by the Clinician Dashboard's shared exercise editor (components/pro/dashboard/
// HepExerciseList.tsx) and the Exercise Programs builder (components/HepBuilder.tsx). Same
// shape as HepBuilder's DraftExercise minus the client-only numeric `id`. `weight` is always
// pounds in the Exercise Programs builder (a bare number, e.g. "20" — the "(lbs)" is on the
// field's label, not the value) but stays free text at the type level since the Clinician
// Dashboard's own weight field still allows non-numeric values like "bodyweight" or "2 lb
// ankle weight". `frequency` (how often per day/week, e.g. "2x/day") and `hold` (how long a
// held position is held, e.g. "5 sec") are both free text for the same "doesn't cleanly
// reduce to one number" reasoning. Movement Lab picks (the autocomplete and the standalone
// picker) backfill frequency and hold automatically where the exercise bank specifies them —
// weight never gets backfilled, since Movement Lab dosage doesn't specify a load.
export interface HepTemplateExercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  frequency: string;
  hold: string;
  notes: string;
  imageUrl: string;
  videoUrl: string;
}

/** Safely turns one of the Json exercise columns above into HepTemplateExercise[] — same
 *  defensive shape-coercion loadHepTemplateAction (app/actions/hep.ts) already used for
 *  HEPTemplate.exercises, pulled out here so the Clinician Dashboard's HEP/Session Exercises
 *  reads (a Json? field that can be null, and was never runtime-validated at write time) can
 *  share it instead of re-deriving the same map/coalesce logic per call site. */
export function parseHepExercises(raw: unknown): HepTemplateExercise[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((ex) => {
    const e = ex as Partial<HepTemplateExercise>;
    return {
      name: e.name ?? "",
      sets: e.sets ?? "",
      reps: e.reps ?? "",
      weight: e.weight ?? "",
      frequency: e.frequency ?? "",
      hold: e.hold ?? "",
      notes: e.notes ?? "",
      imageUrl: e.imageUrl ?? "",
      videoUrl: e.videoUrl ?? "",
    };
  });
}
