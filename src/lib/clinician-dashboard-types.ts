/** Shared fixed-value lists for the LimbicPRO Clinician Dashboard (/pro/dashboard) — one
 *  place both the server actions (app/actions/clinician-dashboard.ts, for validation) and
 *  the dashboard's own form components (components/pro/*) read from, so the two can never
 *  drift out of sync the way two separately hand-typed option lists eventually do. Same
 *  "plain string, not an enum" convention as HEPTemplate.bodyPart in schema.prisma — see
 *  that field's own comment for why.
 */

export const BODY_REGIONS = [
  "Spine",
  "Shoulder",
  "Elbow and Wrist",
  "Hip",
  "Knee",
  "Ankle and Foot",
  "Neurological",
  "Cardiopulmonary",
  "General",
] as const;

export const CLINICIAN_SPECIALTIES = [
  "Musculoskeletal",
  "Neurological",
  "Cardiopulmonary",
  "Pediatrics",
  "Geriatrics",
  "Sports",
] as const;

export const OUTCOME_MEASURES = ["Berg", "TUG", "LEFS", "DASH", "NPRS", "PSFS", "KOOS", "IKDC", "Oswestry", "Other"] as const;

export const CLINICAL_NOTE_TYPES = ["Initial Eval", "SOAP", "Progress Note", "Discharge Summary"] as const;

/** A patient is flagged "due for reassessment" every REASSESSMENT_INTERVAL_VISITS visits
 *  (a standard periodic-reassessment cadence), or once it's been
 *  REASSESSMENT_STALE_DAYS since they were last seen — see
 *  getPatientsNeedingReassessment in app/actions/clinician-dashboard.ts, the single place
 *  that combines these two into the actual flag so the dashboard summary tile and the
 *  patient-panel badge can never disagree on the definition. */
export const REASSESSMENT_INTERVAL_VISITS = 6;
export const REASSESSMENT_STALE_DAYS = 14;

/** Body-region pill accent — cycles through the app's existing tag-* palette (see
 *  .tag-accent/.tag-accent-2/.tag-neutral/.tag-outline in globals.css) rather than
 *  inventing a new color per region, so a patient's region pill always reads as "one of
 *  this app's existing categorical tags," not a new visual language. */
const BODY_REGION_TAG_CLASSES = ["tag-accent", "tag-accent-2", "tag-neutral", "tag-outline"] as const;
export function bodyRegionTagClass(bodyRegion: string): string {
  const index = BODY_REGIONS.indexOf(bodyRegion as (typeof BODY_REGIONS)[number]);
  return BODY_REGION_TAG_CLASSES[(index < 0 ? 0 : index) % BODY_REGION_TAG_CLASSES.length];
}
