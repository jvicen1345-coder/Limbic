import { HEP_TEMPLATE_BODY_PARTS, type HepTemplateBodyPart } from "@/lib/hep-templates";

export { HEP_TEMPLATE_BODY_PARTS };

export interface CourseworkHepExercise {
  name: string;
  /** General/typical dosage language ("2–3 sets of 10–15 reps, progressing as tolerated")
   *  rather than one invented precise number — same "don't state a specific clinical figure
   *  you can't back with a source" discipline as
   *  therapeutic-exercises-static.ts/board-content.ts, just applied to a program-design
   *  teaching example instead of a single exercise entry. */
  dosage: string;
  note: string;
}

export interface CourseworkHepTemplate {
  id: string;
  /** e.g. "Post-ACL Reconstruction — Phase 1 (0–2 weeks)" */
  name: string;
  bodyPart: HepTemplateBodyPart;
  /** One line: what this phase/program is trying to accomplish. */
  goal: string;
  exercises: CourseworkHepExercise[];
}

/**
 * One illustrative, standard-of-care example program per HEP_TEMPLATE_BODY_PARTS category
 * (see lib/hep-templates.ts, which the real /hep Builder's own template picker uses) — the
 * kind of case a DPT program's therapeutic-exercise or clinical-education coursework would
 * actually assign as a teaching example. These are widely-taught progressions general enough
 * to state responsibly without a citation (the same reasoning bar
 * lib/pathologies-static.ts's condition explanations and lib/board-content.ts's questions
 * hold to), not a specific patient's real prescription — see the disclaimer rendered above
 * this content in app/(app)/student/hep-templates/page.tsx. Grows one real entry at a time,
 * same discipline as THERAPEUTIC_EXERCISES in therapeutic-exercises-static.ts.
 */
export const COURSEWORK_HEP_TEMPLATES: CourseworkHepTemplate[] = [
  {
    id: "acl-recon-phase1",
    name: "Post-ACL Reconstruction — Phase 1 (0–2 weeks)",
    bodyPart: "Post-Surgical",
    goal: "Protect the graft while restoring quad activation, full passive extension, and controlling swelling.",
    exercises: [
      { name: "Quad sets", dosage: "2–3 sets of 10–15, several times a day", note: "Focus on a strong, visible quad contraction, not just knee pressure into the surface." },
      { name: "Heel slides", dosage: "2–3 sets of 10–15, within pain-free range", note: "Progress flexion gradually; don't force past the surgeon's protocol-specific limit." },
      { name: "Passive/active-assisted knee extension", dosage: "Multiple short holds daily", note: "Full passive extension equal to the uninvolved side is a priority early goal." },
      { name: "Straight leg raise", dosage: "2–3 sets of 10, once quad set is strong with no extension lag", note: "Hold briefly at the top; stop if an extensor lag appears." },
      { name: "Ankle pumps", dosage: "Frequent sets throughout the day", note: "For circulation and DVT-risk reduction while activity is limited." },
    ],
  },
  {
    id: "rtc-repair-phase1",
    name: "Rotator Cuff Repair — Phase 1 (0–4 weeks, sling immobilization)",
    bodyPart: "Shoulder",
    goal: "Protect the repair (passive motion only) while preventing stiffness and maintaining distal mobility.",
    exercises: [
      { name: "Pendulum swings", dosage: "1–2 sets of 10–15 small circles, as directed by the surgeon", note: "Gravity-assisted, passive only, no active shoulder muscle use." },
      { name: "Passive range of motion (therapist- or table-assisted)", dosage: "Per protocol, typically daily", note: "Stays strictly within the repair's protected range for this phase." },
      { name: "Elbow, wrist, and hand active range of motion", dosage: "Several sets daily", note: "Keeps distal joints mobile while the shoulder itself stays protected." },
      { name: "Scapular pinches (isometric, sling on)", dosage: "2 sets of 10 gentle holds", note: "Light scapular activation only, no shoulder joint movement." },
    ],
  },
  {
    id: "low-back-core-stabilization",
    name: "Low Back Pain — Core Stabilization Progression",
    bodyPart: "Spine",
    goal: "Build pain-free lumbopelvic control before progressing to more dynamic loading.",
    exercises: [
      { name: "Abdominal drawing-in maneuver", dosage: "2–3 sets of 10 holds, 5–10 seconds each", note: "Cue a gentle draw-in without breath holding or pelvic tilt." },
      { name: "Bird dog", dosage: "2–3 sets of 8–10 per side", note: "Progress from short-lever (arm or leg only) to full opposite arm/leg extension." },
      { name: "Bridging", dosage: "2–3 sets of 10–12", note: "Watch for compensatory lumbar extension or hip hike." },
      { name: "Dead bug", dosage: "2 sets of 8–10 per side", note: "Keep the low back flat against the surface throughout the movement." },
    ],
  },
  {
    id: "tka-early-mobility",
    name: "Total Knee Arthroplasty — Early Mobility (0–2 weeks)",
    bodyPart: "Post-Surgical",
    goal: "Restore functional range of motion and quad control to support safe gait and stair use.",
    exercises: [
      { name: "Quad sets", dosage: "2–3 sets of 10–15, several times a day", note: "Same rationale as post-ACLR — quad activation is often the rate-limiting factor early on." },
      { name: "Heel slides", dosage: "2–3 sets of 10–15", note: "Working toward at least 90° of flexion supports functional stair negotiation." },
      { name: "Seated knee extension (active)", dosage: "2 sets of 10–15", note: "Reinforces terminal extension, which surgical swelling often limits." },
      { name: "Ankle pumps", dosage: "Frequent sets throughout the day", note: "Same DVT-risk-reduction rationale as other lower-extremity post-surgical programs." },
      { name: "Assisted gait training", dosage: "As tolerated, per weight-bearing status", note: "Progresses from walker/crutches toward a cane as strength and confidence allow." },
    ],
  },
  {
    id: "adhesive-capsulitis-mobility",
    name: "Adhesive Capsulitis — Frozen (Stiff) Phase Mobility",
    bodyPart: "Shoulder",
    goal: "Improve motion gently across a joint that responds poorly to aggressive, painful stretching.",
    exercises: [
      { name: "Table slides (flexion)", dosage: "2–3 sets of 10, holding briefly at end range", note: "A low-load, self-paced way to work into flexion without a partner." },
      { name: "Wand-assisted external rotation", dosage: "2 sets of 10", note: "Use the uninvolved arm to gently guide range, staying below a sharp pain response." },
      { name: "Doorway/corner pec stretch", dosage: "2–3 holds of 20–30 seconds", note: "A mild, sustained stretch tends to be better tolerated than repeated forceful ones in this phase." },
      { name: "Pendulum swings", dosage: "1–2 sets of 10–15", note: "Gentle, gravity-assisted motion for a joint that's often reactive to more active work." },
    ],
  },
  {
    id: "lateral-ankle-sprain-progression",
    name: "Lateral Ankle Sprain — Functional Progression",
    bodyPart: "Ankle and Foot",
    goal: "Restore range, strength, and proprioception before returning to cutting/pivoting activity.",
    exercises: [
      { name: "Ankle alphabet", dosage: "1–2 sets, both directions", note: "A simple, active way to work through available range in early rehab." },
      { name: "Resisted band eversion", dosage: "2–3 sets of 12–15", note: "Targets the peroneals, commonly under-recovered after a lateral sprain." },
      { name: "Single-leg balance (progressing to unstable surface)", dosage: "2–3 sets of 20–30 seconds", note: "Proprioceptive deficit after a sprain is a well-established re-injury risk factor." },
      { name: "Calf raises", dosage: "2–3 sets of 12–15", note: "Progress from double-leg to single-leg as tolerated." },
      { name: "Lateral band walks", dosage: "2 sets of 10–12 steps per direction", note: "A later-stage step toward multidirectional loading." },
    ],
  },
  {
    id: "stroke-early-mobility",
    name: "Stroke (Hemiparesis) — Early Mobility and Task Practice",
    bodyPart: "Neurological",
    goal: "Support safe transfers, sitting balance, and early weight-bearing on the involved side.",
    exercises: [
      { name: "Sitting balance activities (weight shifts, reaching)", dosage: "Multiple short sessions, as tolerated", note: "Builds trunk control that underlies most functional transfers." },
      { name: "Sit-to-stand practice", dosage: "2–3 sets of 5–10, with appropriate assist/guarding", note: "A high-value functional task, practiced with the level of support the person currently needs." },
      { name: "Weight-bearing through the involved upper extremity (if appropriate)", dosage: "Short bouts, as tolerated", note: "Helps counter learned non-use, when not contraindicated by shoulder status." },
      { name: "Gait training with appropriate assistive device", dosage: "As tolerated, per therapist guarding level", note: "Progresses as balance, strength, and safety awareness improve." },
    ],
  },
  {
    id: "tha-precautions-program",
    name: "Total Hip Arthroplasty — Early Program (Precautions-Based)",
    bodyPart: "Hip",
    goal: "Build hip and lower-extremity strength while respecting the surgeon's specific approach-based precautions.",
    exercises: [
      { name: "Ankle pumps", dosage: "Frequent sets throughout the day", note: "Same circulation/DVT-risk rationale as other post-surgical lower-extremity programs." },
      { name: "Quad sets", dosage: "2–3 sets of 10–15", note: "Maintains quad activation while hip motion itself may be more restricted early on." },
      { name: "Gluteal sets", dosage: "2–3 sets of 10–15 gentle holds", note: "Early, low-load activation of a key hip stabilizer." },
      { name: "Standing hip abduction (within precautions)", dosage: "2 sets of 10 per side", note: "Exact allowable range depends on the surgical approach and the surgeon's specific precautions." },
      { name: "Assisted gait training", dosage: "As tolerated, per weight-bearing status", note: "Progresses toward a cane as strength, confidence, and precaution timelines allow." },
    ],
  },
  {
    id: "geriatric-general-conditioning",
    name: "Geriatric General Conditioning — Fall-Risk Reduction",
    bodyPart: "General Conditioning",
    goal: "Build the strength and balance most closely tied to fall risk in a general older-adult population.",
    exercises: [
      { name: "Sit-to-stand", dosage: "2–3 sets of 8–12, using armrests as needed", note: "One of the most functionally relevant lower-extremity strength exercises for this population." },
      { name: "Marching in place / step-ups", dosage: "2 sets of 10–12", note: "Builds the hip flexor and quad strength that supports stair negotiation and gait clearance." },
      { name: "Tandem stance / single-leg stance (near support)", dosage: "2–3 sets of 20–30 seconds", note: "Static balance training is a well-established piece of fall-prevention programming." },
      { name: "Heel-to-toe walking", dosage: "2 sets of 10 steps", note: "Challenges dynamic balance in a way static stance work doesn't." },
    ],
  },
];

export function templatesByBodyPart(): Record<HepTemplateBodyPart, CourseworkHepTemplate[]> {
  const grouped = {} as Record<HepTemplateBodyPart, CourseworkHepTemplate[]>;
  for (const bp of HEP_TEMPLATE_BODY_PARTS) grouped[bp] = [];
  for (const t of COURSEWORK_HEP_TEMPLATES) grouped[t.bodyPart].push(t);
  return grouped;
}
