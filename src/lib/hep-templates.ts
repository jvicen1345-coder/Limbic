/**
 * The fixed body-part categories the /hep template library panel groups saved templates
 * under (see components/HepTemplateLibrary.tsx). A separate, purpose-built list from
 * therapeutic-exercises-static.ts's REGIONS — that one drives the exercise library picker
 * and doesn't line up with what a clinician actually organizes whole HEP templates by
 * (e.g. "Post-Surgical" and "General Conditioning" aren't exercise regions, they're
 * program categories).
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

// Same shape as HepBuilder's DraftExercise, minus the client-only numeric `id` — what
// actually gets persisted as HEPTemplate.exercises.
export interface HepTemplateExercise {
  name: string;
  sets: string;
  reps: string;
  notes: string;
  imageUrl: string;
  videoUrl: string;
}
