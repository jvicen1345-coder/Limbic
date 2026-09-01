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

// What actually gets persisted as HEPTemplate.exercises, PatientHEPAssignment.exercises, and
// SessionExerciseLog.exercises (see each model's own comment in schema.prisma) — read/written
// by the Clinician Dashboard's shared exercise editor (components/pro/dashboard/
// HepExerciseList.tsx). Same shape as HepBuilder's DraftExercise minus the client-only
// numeric `id`, EXCEPT `weight` — that field is dashboard-only (the load used for that
// exercise this HEP/session, e.g. "20 lbs", "2 lb ankle weight", "bodyweight"; free text like
// sets/reps rather than a strict number, so it stays meaningful for a hold- or band-based
// exercise with no plate weight). HepBuilder's own template-authoring flow (the /hep page)
// doesn't collect it, so a template built there always snapshots weight as "" — acceptable
// since it's optional context, not required to render or use the program.
export interface HepTemplateExercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
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
      notes: e.notes ?? "",
      imageUrl: e.imageUrl ?? "",
      videoUrl: e.videoUrl ?? "",
    };
  });
}
