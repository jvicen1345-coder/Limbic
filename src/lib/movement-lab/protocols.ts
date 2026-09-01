import type { HepTemplateBodyPart, HepTemplateExercise } from "@/lib/hep-templates";
import type { MovementExercise, MovementRegion } from "@/lib/movement-lab/types";
import { formatDosage } from "@/lib/movement-lab/types";
import { MOVEMENT_EXERCISE_BY_ID } from "@/lib/movement-lab/catalog";

/**
 * Phased reference programs assembled from the exercise bank.
 *
 * These are the same kind of content as lib/coursework-hep-templates.ts — widely-taught,
 * standard-of-care progressions general enough to state responsibly — with two differences
 * that matter. First, a phase's exercises are references (`exerciseId`) rather than inline
 * names, so every step carries the bank's full setup, technique, cueing and precautions
 * instead of one line of dosage text, and a correction to an exercise propagates to every
 * protocol that uses it. Second, each phase carries `criteriaToProgress`, because the thing
 * that most often goes wrong with a phased program is progressing on the calendar rather
 * than on the criteria.
 *
 * A protocol is a starting point for a conversation, never a prescription: the treating
 * clinician's own surgeon-specific protocol, and this particular patient's presentation,
 * override every line here. That is what each protocol's `caution` says, and the UI renders
 * it above the phases rather than tucked away at the bottom.
 */

export interface MovementProtocolStep {
  /** Must resolve through MOVEMENT_EXERCISE_BY_ID. Unresolved ids are dropped by
   *  resolveProtocolSteps rather than rendering an empty row, and are a test failure. */
  exerciseId: string;
  /** Replaces the exercise's own dosage line for this phase — e.g. a post-operative phase
   *  that wants a much higher frequency, or a deliberately reduced range. Omitted when the
   *  exercise's own typical dosage is what this phase intends. */
  dosageOverride?: string;
  /** Why this exercise is in this phase, or the one phase-specific caveat on it. */
  note?: string;
}

export interface MovementProtocolPhase {
  name: string;
  /** Indicative only — the criteria below, not the clock, decide when to move on. */
  timeframe: string;
  goals: string[];
  criteriaToProgress: string[];
  steps: MovementProtocolStep[];
}

export interface MovementProtocol {
  id: string;
  name: string;
  region: MovementRegion;
  /** Which of the HEP Builder's nine template categories this belongs under, so a loaded
   *  phase can be saved straight back as a user template — see lib/hep-templates.ts. */
  bodyPart: HepTemplateBodyPart;
  summary: string;
  /** The "what overrides this" line, rendered above the phases. Never empty. */
  caution: string;
  phases: MovementProtocolPhase[];
}

export const MOVEMENT_PROTOCOLS: MovementProtocol[] = [
  {
    id: "acl-reconstruction",
    name: "ACL Reconstruction",
    region: "Knee",
    bodyPart: "Post-Surgical",
    summary:
      "Protect the graft while restoring full passive extension and quadriceps control, then rebuild strength and single-leg control before any return to running or sport.",
    caution:
      "Graft type, meniscal repair and fixation all change what is permitted and when — the surgeon's protocol overrides every line here, particularly on open-chain knee extension and weight-bearing. Return to sport is decided on strength and hop-test symmetry, not on months elapsed.",
    phases: [
      {
        name: "Phase 1 — Protection and quadriceps activation",
        timeframe: "Roughly 0–2 weeks",
        goals: [
          "Full passive knee extension equal to the other side",
          "A strong quadriceps contraction with no extensor lag",
          "Control swelling and restore a normal walking pattern",
        ],
        criteriaToProgress: [
          "Full passive extension matching the uninvolved knee",
          "Straight leg raise with no extensor lag",
          "Minimal swelling and a normal heel-to-toe gait",
        ],
        steps: [
          { exerciseId: "quad-set", dosageOverride: "10 reps, 5–10 s holds, several times a day", note: "The priority of this phase. Quality of contraction matters more than volume." },
          { exerciseId: "heel-slide", dosageOverride: "10–15 reps, 3–4x/day", note: "Progress flexion gradually within the surgeon's limit." },
          { exerciseId: "prone-knee-hang", note: "Full passive extension is a priority early goal — this is how it is regained." },
          { exerciseId: "straight-leg-raise", note: "Only once the quad set can hold the knee straight. An extensor lag means go back to quad sets." },
          { exerciseId: "ankle-pumps", dosageOverride: "20–30 reps every hour while awake", note: "Circulation while activity is limited." },
          { exerciseId: "patellar-mobilization", note: "Keeps the kneecap mobile while the quadriceps is inhibited." },
        ],
      },
      {
        name: "Phase 2 — Range, gait and early loading",
        timeframe: "Roughly 2–8 weeks",
        goals: [
          "Full knee flexion range",
          "Normal gait without a limp or an aid",
          "Early closed-chain quadriceps and gluteal strength",
        ],
        criteriaToProgress: [
          "Full, pain-free knee range in both directions",
          "No swelling response to daily activity",
          "Comfortable single-leg stance for 30 seconds with a level pelvis",
        ],
        steps: [
          { exerciseId: "mini-squat", note: "First closed-chain loading — depth guided by comfort and swelling response." },
          { exerciseId: "glute-bridge" },
          { exerciseId: "terminal-knee-extension", note: "Loads the last part of extension, which is where the quadriceps is usually weakest." },
          { exerciseId: "clamshell" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "stationary-cycling", dosageOverride: "10–20 minutes, low resistance, most days", note: "Range and conditioning without impact." },
          { exerciseId: "prone-hamstring-curl", note: "Delayed where a hamstring graft was harvested — check the protocol." },
        ],
      },
      {
        name: "Phase 3 — Strength and single-leg control",
        timeframe: "Roughly 2–5 months",
        goals: [
          "Symmetrical single-leg strength",
          "Control of knee position under load with no inward collapse",
          "Build tolerance for progressively heavier loading",
        ],
        criteriaToProgress: [
          "Single-leg strength within roughly 10% of the other side on the clinic's chosen tests",
          "Lateral step-down with no knee collapse inward and a level pelvis",
          "No swelling after a full strength session",
        ],
        steps: [
          { exerciseId: "box-squat" },
          { exerciseId: "step-up" },
          { exerciseId: "split-squat" },
          { exerciseId: "lateral-step-down", note: "The control test as much as the exercise — watch for knee collapse." },
          { exerciseId: "single-leg-bridge" },
          { exerciseId: "single-leg-rdl" },
          { exerciseId: "single-leg-heel-raise" },
          { exerciseId: "lateral-band-walk" },
        ],
      },
      {
        name: "Phase 4 — Return to running and sport",
        timeframe: "From roughly 3–6 months, criteria-dependent",
        goals: [
          "Return to running, then to change of direction and impact",
          "Restore power and landing control",
          "Confidence in the knee under sport-specific demand",
        ],
        criteriaToProgress: [
          "Limb symmetry index at or above the clinic's threshold on strength and hop testing",
          "Symmetrical, controlled landing mechanics",
          "Clearance from the surgeon and treating clinician for the specific sport",
        ],
        steps: [
          { exerciseId: "return-to-running-progression", note: "Entry criteria must be met first — the criteria decide the start date, not the calendar." },
          { exerciseId: "nordic-hamstring-curl", note: "Twice weekly at most; expect delayed soreness at first." },
          { exerciseId: "split-squat" },
          { exerciseId: "lateral-step-down" },
          { exerciseId: "pallof-press" },
          { exerciseId: "full-body-resistance-circuit", note: "The maintenance work that continues after discharge." },
        ],
      },
    ],
  },
  {
    id: "rotator-cuff-repair",
    name: "Rotator Cuff Repair",
    region: "Shoulder",
    bodyPart: "Post-Surgical",
    summary:
      "Protect the repair with passive motion only, then restore active range, then load the cuff and scapular muscles progressively.",
    caution:
      "Tear size, repair technique and whether the subscapularis was involved all change the permitted range and the timeline — the surgeon's protocol overrides every line here. Resisted internal rotation in particular is restricted after subscapularis repair.",
    phases: [
      {
        name: "Phase 1 — Protection, passive motion only",
        timeframe: "Roughly 0–4 weeks, sling immobilisation",
        goals: [
          "Protect the repair",
          "Prevent stiffness within the permitted range",
          "Maintain elbow, wrist and hand mobility",
        ],
        criteriaToProgress: [
          "Surgeon's clearance to begin active-assisted motion",
          "Passive range within the protocol's target for this phase",
          "Pain controlled at rest and at night",
        ],
        steps: [
          { exerciseId: "pendulum", dosageOverride: "10–15 small swings each direction, 2–3x/day", note: "Passive by definition — no shoulder muscle effort. Often the only shoulder movement permitted now." },
          { exerciseId: "elbow-arom", dosageOverride: "10–15 reps, several times a day", note: "Keeps the distal joints mobile while the shoulder stays protected." },
          { exerciseId: "wrist-arom" },
          { exerciseId: "grip-squeeze", dosageOverride: "10–15 gentle squeezes, 1–2x/day" },
          { exerciseId: "scapular-setting", dosageOverride: "10 gentle 5 s holds, 1–2x/day", note: "Can usually be done with the sling on — confirm it is permitted." },
          { exerciseId: "cervical-rotation-arom", note: "The neck stiffens quickly in a sling." },
        ],
      },
      {
        name: "Phase 2 — Active-assisted then active range",
        timeframe: "Roughly 4–10 weeks",
        goals: [
          "Restore full passive and then active range",
          "Begin submaximal cuff isometrics",
          "Normalise scapular movement",
        ],
        criteriaToProgress: [
          "Near-full active elevation without shrugging or trunk lean",
          "Pain-free submaximal isometrics in all directions",
          "Surgeon's clearance to begin resisted strengthening",
        ],
        steps: [
          { exerciseId: "table-slide", note: "The table carries the weight of the arm — the least demanding way to gain elevation." },
          { exerciseId: "supine-cane-flexion", note: "Let the uninvolved arm do the lifting." },
          { exerciseId: "supine-cane-external-rotation", note: "Stay inside the surgeon's external rotation limit." },
          { exerciseId: "wall-walk-flexion" },
          { exerciseId: "isometric-shoulder-er", dosageOverride: "8–10 reps, 5–10 s holds at ~50% effort, once daily" },
          { exerciseId: "isometric-shoulder-ir", note: "Restricted after subscapularis repair — check the protocol before including this." },
          { exerciseId: "thoracic-extension-chair", note: "A stiff thoracic spine limits how far the shoulder can go." },
        ],
      },
      {
        name: "Phase 3 — Cuff and scapular strengthening",
        timeframe: "Roughly 3–6 months",
        goals: [
          "Restore cuff and scapular strength",
          "Return to overhead reaching and lifting",
          "Restore endurance for repeated daily tasks",
        ],
        criteriaToProgress: [
          "Full pain-free active range",
          "Cuff strength approaching the other side",
          "Able to perform overhead work without a painful arc or compensation",
        ],
        steps: [
          { exerciseId: "band-external-rotation" },
          { exerciseId: "band-internal-rotation", note: "Timing depends on whether the subscapularis was repaired." },
          { exerciseId: "band-row" },
          { exerciseId: "sidelying-external-rotation", note: "Start with no weight at all — 1–3 lb is often plenty here." },
          { exerciseId: "scaption-raise" },
          { exerciseId: "serratus-punch" },
          { exerciseId: "prone-y-raise" },
          { exerciseId: "closed-chain-wall-stabilization", note: "Confirm weight-bearing through the arm is permitted." },
        ],
      },
    ],
  },
  {
    id: "total-knee-replacement",
    name: "Total Knee Replacement",
    region: "Knee",
    bodyPart: "Post-Surgical",
    summary:
      "Range of motion and quadriceps activation are the early priorities, then functional strength and walking endurance.",
    caution:
      "Range-of-motion targets and weight-bearing status come from the surgeon and the operating team. Full extension is usually the harder and more important goal than flexion — losing it is much harder to recover than gaining a few more degrees of bend.",
    phases: [
      {
        name: "Phase 1 — Range, activation and safe mobility",
        timeframe: "Roughly 0–3 weeks",
        goals: [
          "Full knee extension",
          "Knee flexion toward the surgeon's target",
          "Safe transfers and walking with the prescribed aid",
          "Manage swelling",
        ],
        criteriaToProgress: [
          "Full or near-full passive extension",
          "Flexion at or approaching the surgeon's target",
          "Independent, safe transfers and short-distance walking",
        ],
        steps: [
          { exerciseId: "quad-set", dosageOverride: "10 reps, 5–10 s holds, several times a day" },
          { exerciseId: "heel-slide", dosageOverride: "10–15 reps, 3–4x/day", note: "The main flexion driver early on." },
          { exerciseId: "prone-knee-hang", note: "Prioritise this — regaining lost extension later is much harder." },
          { exerciseId: "ankle-pumps", dosageOverride: "20–30 reps every hour while awake" },
          { exerciseId: "straight-leg-raise" },
          { exerciseId: "patellar-mobilization", note: "Avoid direct pressure on the healing incision." },
          { exerciseId: "sit-to-stand", dosageOverride: "8–12 reps from a higher seat, using armrests as needed" },
        ],
      },
      {
        name: "Phase 2 — Functional strength",
        timeframe: "Roughly 3–8 weeks",
        goals: [
          "Walk without an aid where safe",
          "Manage stairs",
          "Restore quadriceps and gluteal strength",
        ],
        criteriaToProgress: [
          "Walking without an aid with a symmetrical pattern",
          "Ascending and descending a flight of stairs safely",
          "Sit-to-stand without pushing off the arms",
        ],
        steps: [
          { exerciseId: "long-arc-quad" },
          { exerciseId: "mini-squat" },
          { exerciseId: "glute-bridge" },
          { exerciseId: "step-up", note: "Start with a low step and a handrail." },
          { exerciseId: "standing-hip-march" },
          { exerciseId: "double-leg-heel-raise" },
          { exerciseId: "stationary-cycling", note: "Raise the saddle if flexion range is still limited." },
          { exerciseId: "walking-program" },
        ],
      },
      {
        name: "Phase 3 — Endurance and return to activity",
        timeframe: "From roughly 8 weeks",
        goals: [
          "Restore walking endurance",
          "Confident stairs and outdoor walking",
          "Maintain strength long term",
        ],
        criteriaToProgress: [
          "Walking tolerance meeting the person's own daily needs",
          "Confident stair descent",
          "A maintenance program the person will actually keep doing",
        ],
        steps: [
          { exerciseId: "box-squat" },
          { exerciseId: "forward-step-down" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "stair-climbing" },
          { exerciseId: "walking-program", dosageOverride: "Build toward 20–30 minutes most days" },
          { exerciseId: "full-body-resistance-circuit", note: "The long-term maintenance work." },
        ],
      },
    ],
  },
  {
    id: "total-hip-replacement",
    name: "Total Hip Replacement",
    region: "Hip & Pelvis",
    bodyPart: "Post-Surgical",
    summary:
      "Restore safe mobility and hip strength within the surgeon's precautions, then build single-leg control and walking endurance.",
    caution:
      "Hip precautions depend entirely on the surgical approach and the surgeon's preference — some approaches have few restrictions and others limit flexion, adduction and rotation for weeks. Confirm this patient's precautions before including any exercise here; several of these positions may be prohibited.",
    phases: [
      {
        name: "Phase 1 — Safe mobility within precautions",
        timeframe: "Roughly 0–3 weeks",
        goals: [
          "Safe transfers and walking with the prescribed aid",
          "Activate the hip muscles",
          "Protect the joint within the stated precautions",
        ],
        criteriaToProgress: [
          "Independent, safe transfers and walking with the aid",
          "Able to activate the gluteals with a visible contraction",
          "Understanding of and adherence to the precautions",
        ],
        steps: [
          { exerciseId: "ankle-pumps", dosageOverride: "20–30 reps every hour while awake" },
          { exerciseId: "quad-set" },
          { exerciseId: "glute-bridge", dosageOverride: "Small-range lift only, 10 reps", note: "Confirm bridging is permitted with this approach." },
          { exerciseId: "standing-hip-march", dosageOverride: "10 reps each side, holding a counter", note: "Keep hip flexion inside the permitted range." },
          { exerciseId: "sit-to-stand", note: "Seat height matters — a seat that is too low breaches a flexion precaution." },
          { exerciseId: "standing-weight-shift" },
        ],
      },
      {
        name: "Phase 2 — Hip strength and gait",
        timeframe: "Roughly 3–8 weeks",
        goals: [
          "Walk without an aid where safe",
          "Restore hip abductor and extensor strength",
          "Restore a symmetrical gait pattern",
        ],
        criteriaToProgress: [
          "Walking without an aid with a level pelvis and no lurch",
          "Single-leg stance for 30 seconds with a level pelvis",
          "Stairs managed safely",
        ],
        steps: [
          { exerciseId: "standing-band-hip-abduction" },
          { exerciseId: "prone-hip-extension", note: "Small range — keep the low back still." },
          { exerciseId: "sidestep-walk" },
          { exerciseId: "step-up" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "mini-squat" },
          { exerciseId: "walking-program" },
        ],
      },
      {
        name: "Phase 3 — Endurance and return to activity",
        timeframe: "From roughly 8 weeks",
        goals: [
          "Restore walking and standing endurance",
          "Build single-leg strength",
          "Long-term maintenance",
        ],
        criteriaToProgress: [
          "Walking tolerance meeting the person's daily needs",
          "Symmetrical single-leg strength on the clinic's chosen tests",
          "A maintenance program in place",
        ],
        steps: [
          { exerciseId: "split-squat", note: "Only once hip precautions have been lifted." },
          { exerciseId: "single-leg-bridge" },
          { exerciseId: "lateral-band-walk" },
          { exerciseId: "step-up" },
          { exerciseId: "stair-climbing" },
          { exerciseId: "full-body-resistance-circuit" },
        ],
      },
    ],
  },
  {
    id: "achilles-tendinopathy",
    name: "Mid-Portion Achilles Tendinopathy",
    region: "Ankle & Foot",
    bodyPart: "Ankle and Foot",
    summary:
      "Graded calf loading, built from isometrics through slow heavy loading to the eccentric heel-drop program, then back to running.",
    caution:
      "Insertional Achilles pain — right at the back of the heel bone — usually does not tolerate the below-neutral heel-drop range, so the range is kept above neutral for that presentation. Not appropriate after Achilles rupture or repair without the surgeon's clearance. Some tendon discomfort during loading is expected; symptoms worsening day to day mean the load is too high.",
    phases: [
      {
        name: "Phase 1 — Settle and load isometrically",
        timeframe: "Roughly 0–2 weeks",
        goals: [
          "Reduce pain irritability",
          "Begin tolerating calf load",
          "Restore ankle range",
        ],
        criteriaToProgress: [
          "Pain settling within 24 hours of loading",
          "Able to complete double-leg heel raises without a pain flare",
          "Full ankle dorsiflexion range restored",
        ],
        steps: [
          { exerciseId: "seated-heel-raise", dosageOverride: "3 sets of 15–20, once daily", note: "Bent-knee loading is usually the best-tolerated starting point." },
          { exerciseId: "double-leg-heel-raise" },
          { exerciseId: "gastrocnemius-stretch" },
          { exerciseId: "soleus-stretch" },
          { exerciseId: "knee-to-wall" },
          { exerciseId: "graded-activity-pacing", note: "Managing daily walking load matters as much as the exercises." },
        ],
      },
      {
        name: "Phase 2 — Slow heavy loading",
        timeframe: "Roughly 2–12 weeks",
        goals: [
          "Build calf strength through full range",
          "Restore single-leg heel raise capacity",
          "Progressively load the tendon",
        ],
        criteriaToProgress: [
          "Single-leg heel raises with good height and symmetry",
          "Morning stiffness settling",
          "Pain-free walking",
        ],
        steps: [
          { exerciseId: "single-leg-heel-raise", note: "Height and symmetry matter more than the number of repetitions." },
          { exerciseId: "eccentric-heel-drop", note: "Three sets of fifteen, twice daily, with the knee straight and then slightly bent." },
          { exerciseId: "seated-heel-raise", dosageOverride: "3 sets of 15–20 with weight on the thighs" },
          { exerciseId: "single-leg-bridge" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "short-foot" },
        ],
      },
      {
        name: "Phase 3 — Energy storage and return to running",
        timeframe: "From roughly 12 weeks, criteria-dependent",
        goals: [
          "Restore spring and power in the calf",
          "Return to running",
          "Prevent recurrence",
        ],
        criteriaToProgress: [
          "Symmetrical single-leg heel raise endurance",
          "Pain-free hopping",
          "No morning stiffness",
        ],
        steps: [
          { exerciseId: "single-leg-heel-raise", dosageOverride: "3 sets to near-failure, with added load, every other day" },
          { exerciseId: "return-to-running-progression" },
          { exerciseId: "single-leg-rdl" },
          { exerciseId: "step-up" },
          { exerciseId: "eccentric-heel-drop", dosageOverride: "Maintenance: 3 sets of 15, 2–3x/week", note: "Continuing the loading after symptoms settle is what prevents recurrence." },
        ],
      },
    ],
  },
  {
    id: "lateral-epicondylalgia",
    name: "Lateral Elbow Tendinopathy",
    region: "Elbow, Wrist & Hand",
    bodyPart: "Elbow and Wrist",
    summary:
      "Reduce provocative gripping load, then load the wrist extensors eccentrically and rebuild grip, while addressing the shoulder and neck contributors.",
    caution:
      "Some discomfort during loading is expected and is part of how a tendon responds; symptoms worsening day to day mean the load is too high. Pins and needles in the hand, or symptoms into the neck, point to a different problem and need reassessment rather than more loading.",
    phases: [
      {
        name: "Phase 1 — Settle and offload",
        timeframe: "Roughly 0–2 weeks",
        goals: [
          "Reduce pain irritability",
          "Modify the aggravating gripping and lifting activities",
          "Begin gentle loading",
        ],
        criteriaToProgress: [
          "Pain settling within 24 hours of loading",
          "Able to grip and lift light objects without a flare",
          "Full elbow and wrist range",
        ],
        steps: [
          { exerciseId: "wrist-extensor-stretch" },
          { exerciseId: "grip-squeeze", dosageOverride: "10–15 submaximal squeezes, 5 s holds, once daily", note: "Start gently — a maximal grip early is a common setback." },
          { exerciseId: "wrist-arom" },
          { exerciseId: "forearm-rotation" },
          { exerciseId: "graded-activity-pacing", note: "Reducing the provocative load at work is usually the biggest single change." },
        ],
      },
      {
        name: "Phase 2 — Eccentric and progressive loading",
        timeframe: "Roughly 2–12 weeks",
        goals: [
          "Build wrist extensor strength and load tolerance",
          "Restore pain-free grip strength",
          "Address the shoulder girdle contribution",
        ],
        criteriaToProgress: [
          "Grip strength approaching the other side",
          "Pain-free daily gripping tasks",
          "Able to add weight to the eccentric program without a flare",
        ],
        steps: [
          { exerciseId: "eccentric-wrist-extension", note: "The core of this phase. Add weight in very small increments." },
          { exerciseId: "grip-squeeze", dosageOverride: "2–3 sets of 10–15, building the effort over weeks" },
          { exerciseId: "finger-extension-band" },
          { exerciseId: "band-row", note: "The shoulder girdle is a frequent contributor to elbow load." },
          { exerciseId: "band-external-rotation" },
          { exerciseId: "wrist-extensor-stretch" },
        ],
      },
      {
        name: "Phase 3 — Return to work and sport",
        timeframe: "From roughly 12 weeks",
        goals: [
          "Return to the specific gripping and lifting demands of work or sport",
          "Prevent recurrence",
        ],
        criteriaToProgress: [
          "Symmetrical grip strength",
          "Full work or sport tasks without a next-day flare",
        ],
        steps: [
          { exerciseId: "eccentric-wrist-extension", dosageOverride: "Maintenance: 3 sets of 15, 2–3x/week" },
          { exerciseId: "eccentric-wrist-flexion", note: "Balances the forearm once the extensors tolerate load." },
          { exerciseId: "suitcase-carry", note: "Grip endurance under a functional load." },
          { exerciseId: "band-pull-apart" },
          { exerciseId: "desk-movement-break", note: "For a desk-based contributor." },
        ],
      },
    ],
  },
  {
    id: "low-back-extension-preference",
    name: "Low Back Pain — Extension Preference",
    region: "Lumbar & Core",
    bodyPart: "Spine",
    summary:
      "For the presentation where repeated extension centralises symptoms: use extension to settle the pain, then rebuild trunk control and hinge mechanics.",
    caution:
      "This protocol is only appropriate where a directional preference for extension has actually been established on assessment — the same exercises applied to a flexion-preference or stenosis presentation typically make things worse. Symptoms moving further down the leg mean stop, not push harder. Progressive leg weakness, saddle numbness, or bladder or bowel change need urgent assessment.",
    phases: [
      {
        name: "Phase 1 — Centralise and settle",
        timeframe: "Roughly 0–2 weeks",
        goals: [
          "Move symptoms out of the leg and toward the back",
          "Reduce pain and muscle guarding",
          "Restore comfortable walking and sitting tolerance",
        ],
        criteriaToProgress: [
          "Symptoms centralised — no longer travelling below the knee",
          "Pain-free walking for 10–15 minutes",
          "Able to sit for a normal daily period",
        ],
        steps: [
          { exerciseId: "prone-press-up", dosageOverride: "10 reps every 2–3 hours during a flare", note: "The centralising movement. Watch the leg symptoms carefully." },
          { exerciseId: "standing-lumbar-extension", dosageOverride: "8–10 reps every 1–2 hours of sitting", note: "The portable version for use at work." },
          { exerciseId: "abdominal-draw-in" },
          { exerciseId: "walking-program", dosageOverride: "Short, frequent walks rather than one long one" },
          { exerciseId: "desk-movement-break" },
        ],
      },
      {
        name: "Phase 2 — Trunk control and hip mobility",
        timeframe: "Roughly 2–6 weeks",
        goals: [
          "Build trunk motor control",
          "Restore hip mobility so the back is not compensating",
          "Reduce reliance on the positional exercises",
        ],
        criteriaToProgress: [
          "Symptoms controlled without needing frequent extension breaks",
          "Dead bug and bird dog performed with a still spine",
          "Full hip extension range",
        ],
        steps: [
          { exerciseId: "dead-bug" },
          { exerciseId: "bird-dog" },
          { exerciseId: "glute-bridge" },
          { exerciseId: "half-kneeling-hip-flexor-stretch" },
          { exerciseId: "quadruped-rock-back" },
          { exerciseId: "diaphragmatic-breathing" },
          { exerciseId: "prone-press-up", dosageOverride: "10 reps, 1–2x/day as maintenance" },
        ],
      },
      {
        name: "Phase 3 — Load tolerance and return to activity",
        timeframe: "From roughly 6 weeks",
        goals: [
          "Restore lifting and carrying capacity",
          "Return to work and sport demands",
          "Prevent recurrence",
        ],
        criteriaToProgress: [
          "Able to hinge and lift with a neutral spine under load",
          "Full work or sport tasks without a flare",
          "A maintenance program in place",
        ],
        steps: [
          { exerciseId: "hip-hinge-dowel", note: "Retrain the lifting pattern before adding load to it." },
          { exerciseId: "front-plank" },
          { exerciseId: "side-plank-modified" },
          { exerciseId: "pallof-press" },
          { exerciseId: "suitcase-carry" },
          { exerciseId: "full-body-resistance-circuit" },
        ],
      },
    ],
  },
  {
    id: "lumbar-stenosis",
    name: "Lumbar Spinal Stenosis",
    region: "Lumbar & Core",
    bodyPart: "Spine",
    summary:
      "Use flexion-biased positions and interval walking to build walking tolerance, then add hip and trunk strength.",
    caution:
      "This is the flexion-preference counterpart to the extension protocol — the two are not interchangeable, and extension-biased exercises typically worsen stenosis symptoms. Progressive leg weakness, saddle numbness, or bladder or bowel change need urgent medical assessment rather than exercise.",
    phases: [
      {
        name: "Phase 1 — Symptom relief and walking tolerance",
        timeframe: "Roughly 0–3 weeks",
        goals: [
          "Reduce leg symptoms with flexion-biased positions",
          "Establish an interval walking baseline",
          "Restore confidence in walking",
        ],
        criteriaToProgress: [
          "Reliable ability to settle leg symptoms with a position change",
          "A walking interval established below the symptom threshold",
          "Symptoms not building through the day",
        ],
        steps: [
          { exerciseId: "seated-lumbar-flexion", dosageOverride: "8–10 reps, 2–3x/day or when symptoms build" },
          { exerciseId: "single-knee-to-chest" },
          { exerciseId: "double-knee-to-chest" },
          { exerciseId: "child-pose" },
          { exerciseId: "interval-walking", note: "Set the walking interval just below where symptoms start." },
          { exerciseId: "stationary-cycling", note: "Usually far better tolerated than walking, because the position is flexed." },
        ],
      },
      {
        name: "Phase 2 — Hip and trunk strength",
        timeframe: "Roughly 3–8 weeks",
        goals: [
          "Build hip and trunk strength",
          "Increase walking intervals",
          "Restore lower limb strength lost to reduced activity",
        ],
        criteriaToProgress: [
          "Walking interval doubled from baseline",
          "Single-leg stance for 30 seconds",
          "Sit-to-stand without using the arms",
        ],
        steps: [
          { exerciseId: "glute-bridge" },
          { exerciseId: "clamshell" },
          { exerciseId: "sit-to-stand" },
          { exerciseId: "dead-bug" },
          { exerciseId: "standing-band-hip-abduction" },
          { exerciseId: "interval-walking", dosageOverride: "Lengthen the walking interval before adding cycles" },
          { exerciseId: "sciatic-nerve-glide", note: "Only where a neural component has been identified — a slide, never a held stretch." },
        ],
      },
      {
        name: "Phase 3 — Endurance and daily function",
        timeframe: "From roughly 8 weeks",
        goals: [
          "Maximise walking and standing tolerance",
          "Maintain strength long term",
          "Self-manage flares",
        ],
        criteriaToProgress: [
          "Walking tolerance meeting the person's own daily needs",
          "Confident self-management of a symptom flare",
        ],
        steps: [
          { exerciseId: "interval-walking" },
          { exerciseId: "step-up" },
          { exerciseId: "chair-based-strength-circuit" },
          { exerciseId: "aquatic-walking", note: "Often very well tolerated, and a good way to add volume." },
          { exerciseId: "graded-activity-pacing" },
        ],
      },
    ],
  },
  {
    id: "lateral-ankle-sprain",
    name: "Lateral Ankle Sprain",
    region: "Ankle & Foot",
    bodyPart: "Ankle and Foot",
    summary:
      "Restore range and reduce swelling, then rebuild the peroneals and balance, then return to hopping and change of direction.",
    caution:
      "Rule out a fracture before starting where the mechanism or presentation warrants it — bony tenderness over the malleoli or an inability to weight-bear needs imaging first. Recurrent sprains are common precisely because balance and peroneal work is stopped too early, so the later phases matter as much as the early ones.",
    phases: [
      {
        name: "Phase 1 — Protect, swelling and range",
        timeframe: "Roughly 0–1 week",
        goals: [
          "Reduce swelling",
          "Restore pain-free ankle range",
          "Restore a normal walking pattern",
        ],
        criteriaToProgress: [
          "Walking without a limp",
          "Near-full pain-free ankle range",
          "Swelling clearly reducing",
        ],
        steps: [
          { exerciseId: "ankle-pumps", dosageOverride: "20–30 reps every hour, with the leg elevated" },
          { exerciseId: "ankle-alphabet" },
          { exerciseId: "seated-heel-raise" },
          { exerciseId: "standing-weight-shift" },
          { exerciseId: "quad-set", note: "The whole limb deconditions quickly when walking is limited." },
        ],
      },
      {
        name: "Phase 2 — Strength and balance",
        timeframe: "Roughly 1–4 weeks",
        goals: [
          "Restore peroneal and calf strength",
          "Restore single-leg balance",
          "Restore full dorsiflexion range",
        ],
        criteriaToProgress: [
          "Single-leg stance for 30 seconds with the eyes closed",
          "Symmetrical single-leg heel raises",
          "Full dorsiflexion on knee-to-wall testing",
        ],
        steps: [
          { exerciseId: "band-eversion", note: "The key strengthening direction after a lateral sprain." },
          { exerciseId: "band-inversion" },
          { exerciseId: "band-dorsiflexion" },
          { exerciseId: "knee-to-wall" },
          { exerciseId: "single-leg-heel-raise" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "short-foot" },
        ],
      },
      {
        name: "Phase 3 — Return to sport",
        timeframe: "From roughly 4 weeks, criteria-dependent",
        goals: [
          "Restore dynamic balance on unstable surfaces",
          "Return to running, hopping and change of direction",
          "Reduce recurrence risk",
        ],
        criteriaToProgress: [
          "Confident single-leg balance on a compliant surface",
          "Pain-free hopping and cutting",
          "No sense of the ankle giving way",
        ],
        steps: [
          { exerciseId: "foam-surface-stance" },
          { exerciseId: "lateral-step-down" },
          { exerciseId: "single-leg-rdl" },
          { exerciseId: "return-to-running-progression" },
          { exerciseId: "band-eversion", dosageOverride: "Maintenance: 2–3 sets of 15, 2–3x/week", note: "Continuing this after symptoms settle is what reduces recurrence." },
          { exerciseId: "four-square-step" },
        ],
      },
    ],
  },
  {
    id: "patellofemoral-pain",
    name: "Patellofemoral Pain",
    region: "Knee",
    bodyPart: "Knee",
    summary:
      "Reduce the provocative knee load, build hip and quadriceps strength, then restore control of knee position under single-leg load.",
    caution:
      "Depth and load are the variables that provoke this — reduce them rather than stopping exercise altogether. Pain that is worse at night, or unrelated to activity, needs reassessment rather than a loading progression.",
    phases: [
      {
        name: "Phase 1 — Settle and activate",
        timeframe: "Roughly 0–3 weeks",
        goals: [
          "Reduce pain with daily activity",
          "Activate the quadriceps and gluteals",
          "Identify and modify the provocative loads",
        ],
        criteriaToProgress: [
          "Pain-free daily walking and stairs",
          "Able to perform a mini squat and a clamshell without pain",
        ],
        steps: [
          { exerciseId: "quad-set" },
          { exerciseId: "clamshell" },
          { exerciseId: "glute-bridge" },
          { exerciseId: "mini-squat", dosageOverride: "10–15 reps in a pain-free depth only" },
          { exerciseId: "prone-quad-stretch" },
          { exerciseId: "graded-activity-pacing", note: "Stairs, hills and prolonged sitting are the usual culprits." },
        ],
      },
      {
        name: "Phase 2 — Hip and knee strength",
        timeframe: "Roughly 3–8 weeks",
        goals: [
          "Build hip abductor and extensor strength",
          "Build quadriceps strength through range",
          "Restore stair tolerance",
        ],
        criteriaToProgress: [
          "Pain-free stairs in both directions",
          "Lateral step-down with no knee collapse inward",
          "Symmetrical single-leg strength on the clinic's chosen tests",
        ],
        steps: [
          { exerciseId: "sidelying-hip-abduction" },
          { exerciseId: "lateral-band-walk" },
          { exerciseId: "wall-sit", note: "Choose an angle that can be held for the full time without pain." },
          { exerciseId: "step-up" },
          { exerciseId: "single-leg-bridge" },
          { exerciseId: "box-squat" },
          { exerciseId: "lateral-thigh-foam-roll" },
        ],
      },
      {
        name: "Phase 3 — Control and return to activity",
        timeframe: "From roughly 8 weeks",
        goals: [
          "Control knee position under single-leg load",
          "Return to running or sport",
          "Prevent recurrence",
        ],
        criteriaToProgress: [
          "Controlled single-leg loading with no inward knee collapse",
          "Full activity without next-day pain",
        ],
        steps: [
          { exerciseId: "lateral-step-down" },
          { exerciseId: "split-squat" },
          { exerciseId: "single-leg-rdl" },
          { exerciseId: "return-to-running-progression" },
          { exerciseId: "lateral-band-walk", dosageOverride: "Maintenance: 2–3 sets, 2–3x/week" },
        ],
      },
    ],
  },
  {
    id: "adhesive-capsulitis",
    name: "Adhesive Capsulitis (Frozen Shoulder)",
    region: "Shoulder",
    bodyPart: "Shoulder",
    summary:
      "Work within the irritability of the painful stage, then push range through the stiff stage, then rebuild strength as motion returns.",
    caution:
      "Matching the exercise dose to the stage is the whole art here — aggressive stretching during the painful stage typically prolongs it. Range work should produce a stretch that settles quickly, not pain lasting hours. A shoulder that is losing range rapidly, or is stiff after trauma, needs reassessment rather than more stretching.",
    phases: [
      {
        name: "Phase 1 — Painful stage: pain relief and gentle motion",
        timeframe: "Variable — often several months",
        goals: [
          "Reduce pain, particularly night pain",
          "Maintain what range is available",
          "Avoid provoking the shoulder further",
        ],
        criteriaToProgress: [
          "Night pain settling",
          "Movement limited more by stiffness than by pain",
          "Able to tolerate end-range stretching without a lasting flare",
        ],
        steps: [
          { exerciseId: "pendulum", note: "Passive, gravity-assisted, and well tolerated in the painful stage." },
          { exerciseId: "table-slide" },
          { exerciseId: "supine-cane-flexion", dosageOverride: "10 reps within the comfortable range, 2–3x/day" },
          { exerciseId: "scapular-setting" },
          { exerciseId: "cervical-rotation-arom", note: "The neck takes on the guarding and stiffens too." },
          { exerciseId: "diaphragmatic-breathing" },
        ],
      },
      {
        name: "Phase 2 — Stiff stage: range of motion",
        timeframe: "Variable — often several months",
        goals: [
          "Regain shoulder range in all directions",
          "Restore reaching overhead and behind the back",
          "Restore thoracic contribution to shoulder movement",
        ],
        criteriaToProgress: [
          "Functional range for dressing, reaching and overhead tasks",
          "Range gains holding between sessions",
        ],
        steps: [
          { exerciseId: "supine-cane-external-rotation", note: "External rotation is usually the most restricted direction." },
          { exerciseId: "wall-walk-flexion", note: "Marking the height reached makes slow progress visible." },
          { exerciseId: "towel-internal-rotation-stretch" },
          { exerciseId: "cross-body-stretch" },
          { exerciseId: "foam-roller-thoracic-extension" },
          { exerciseId: "open-book-rotation" },
          { exerciseId: "doorway-pec-stretch" },
        ],
      },
      {
        name: "Phase 3 — Thawing stage: strength and function",
        timeframe: "As range returns",
        goals: [
          "Rebuild cuff and scapular strength lost during the stiff phase",
          "Return to full overhead function",
          "Maintain the range that was regained",
        ],
        criteriaToProgress: [
          "Near-symmetrical range",
          "Strength approaching the other side",
          "Full daily and work function",
        ],
        steps: [
          { exerciseId: "band-external-rotation" },
          { exerciseId: "band-row" },
          { exerciseId: "scaption-raise" },
          { exerciseId: "wall-push-up-plus" },
          { exerciseId: "prone-y-raise" },
          { exerciseId: "supine-cane-external-rotation", dosageOverride: "Maintenance: 10 reps daily", note: "Keeping the range needs ongoing work for months." },
        ],
      },
    ],
  },
  {
    id: "subacromial-shoulder-pain",
    name: "Rotator Cuff Related Shoulder Pain",
    region: "Shoulder",
    bodyPart: "Shoulder",
    summary:
      "Load the cuff progressively while restoring scapular control and thoracic mobility, rather than avoiding the painful arc.",
    caution:
      "This is a loading problem, not a positional one — avoiding overhead movement entirely tends to prolong it. Some discomfort during loading is expected; sharp pain or symptoms lasting well beyond the session mean reduce the load or the range. New weakness, or pain after significant trauma, needs reassessment for a structural tear.",
    phases: [
      {
        name: "Phase 1 — Settle and begin loading",
        timeframe: "Roughly 0–3 weeks",
        goals: [
          "Reduce pain irritability",
          "Begin pain-free cuff loading",
          "Restore scapular awareness",
        ],
        criteriaToProgress: [
          "Pain-free submaximal isometrics",
          "Sleeping through the night",
          "Able to reach to shoulder height without a painful arc",
        ],
        steps: [
          { exerciseId: "isometric-shoulder-er", dosageOverride: "8–10 reps, 5–10 s holds at ~50% effort, once daily" },
          { exerciseId: "isometric-shoulder-ir" },
          { exerciseId: "scapular-setting" },
          { exerciseId: "thoracic-extension-chair" },
          { exerciseId: "table-slide", note: "Elevation with the arm supported, if reaching overhead is painful." },
          { exerciseId: "cross-body-stretch" },
        ],
      },
      {
        name: "Phase 2 — Cuff and scapular strength",
        timeframe: "Roughly 3–10 weeks",
        goals: [
          "Build cuff and scapular strength",
          "Restore pain-free overhead reaching",
          "Restore thoracic mobility",
        ],
        criteriaToProgress: [
          "Pain-free full active range",
          "Cuff strength approaching the other side",
          "Able to load overhead without a painful arc",
        ],
        steps: [
          { exerciseId: "band-external-rotation" },
          { exerciseId: "band-internal-rotation" },
          { exerciseId: "band-row" },
          { exerciseId: "scaption-raise" },
          { exerciseId: "serratus-punch" },
          { exerciseId: "wall-angel" },
          { exerciseId: "foam-roller-thoracic-extension" },
        ],
      },
      {
        name: "Phase 3 — Return to overhead work and sport",
        timeframe: "From roughly 10 weeks",
        goals: [
          "Restore overhead strength and endurance",
          "Return to work or sport demands",
          "Prevent recurrence",
        ],
        criteriaToProgress: [
          "Full symmetrical strength",
          "Full overhead work or sport tasks without a next-day flare",
        ],
        steps: [
          { exerciseId: "sidelying-external-rotation" },
          { exerciseId: "prone-external-rotation-90-90", note: "For the overhead athlete — a late-stage position." },
          { exerciseId: "prone-t-raise" },
          { exerciseId: "wall-push-up-plus" },
          { exerciseId: "closed-chain-wall-stabilization" },
          { exerciseId: "band-pull-apart" },
          { exerciseId: "sleeper-stretch", note: "Only where an internal rotation deficit has actually been identified." },
        ],
      },
    ],
  },
  {
    id: "cervical-radiculopathy",
    name: "Cervical Radiculopathy",
    region: "Cervical",
    bodyPart: "Spine",
    summary:
      "Centralise arm symptoms, add neural gliding within tolerance, then rebuild deep neck flexor and scapular strength.",
    caution:
      "Symptoms travelling further down the arm mean stop, not push harder. Progressive weakness, symptoms in both arms, or any change in walking, balance, bladder or bowel needs urgent assessment. Any end-range cervical extension or rotation work should be assessed before it is prescribed for home.",
    phases: [
      {
        name: "Phase 1 — Centralise and settle",
        timeframe: "Roughly 0–2 weeks",
        goals: [
          "Move symptoms out of the arm and toward the neck",
          "Reduce pain and night waking",
          "Restore comfortable neck range",
        ],
        criteriaToProgress: [
          "Arm symptoms centralised toward the neck",
          "Sleeping through the night",
          "Pain-free cervical rotation for driving",
        ],
        steps: [
          { exerciseId: "cervical-retraction-seated", dosageOverride: "10 reps, several times a day", note: "The first-line directional movement — watch the arm symptoms." },
          { exerciseId: "chin-tuck-supine" },
          { exerciseId: "cervical-rotation-arom" },
          { exerciseId: "upper-trapezius-stretch" },
          { exerciseId: "scapular-setting" },
          { exerciseId: "desk-movement-break" },
        ],
      },
      {
        name: "Phase 2 — Neural mobility and early strength",
        timeframe: "Roughly 2–6 weeks",
        goals: [
          "Restore neural mobility in the arm",
          "Begin deep neck flexor and scapular strengthening",
          "Restore thoracic mobility",
        ],
        criteriaToProgress: [
          "No arm symptoms at rest",
          "Nerve glides performed with no lasting after-effect",
          "Able to hold a chin tuck with a head lift",
        ],
        steps: [
          { exerciseId: "median-nerve-glide", note: "A slide, never a held stretch. Symptoms increasing for hours afterward mean too much." },
          { exerciseId: "chin-tuck-head-lift" },
          { exerciseId: "cervical-isometrics" },
          { exerciseId: "band-row" },
          { exerciseId: "thoracic-extension-chair" },
          { exerciseId: "levator-scapulae-stretch" },
        ],
      },
      {
        name: "Phase 3 — Strength and return to activity",
        timeframe: "From roughly 6 weeks",
        goals: [
          "Restore neck and scapular strength and endurance",
          "Return to work and sport",
          "Prevent recurrence",
        ],
        criteriaToProgress: [
          "Full pain-free range and strength",
          "Full work tasks without symptoms returning",
        ],
        steps: [
          { exerciseId: "prone-head-lift" },
          { exerciseId: "prone-y-raise" },
          { exerciseId: "prone-t-raise" },
          { exerciseId: "wall-angel" },
          { exerciseId: "band-pull-apart" },
          { exerciseId: "chin-tuck-head-lift", dosageOverride: "Maintenance: 2–3 sets of 8–10, 3x/week" },
        ],
      },
    ],
  },
  {
    id: "plantar-heel-pain",
    name: "Plantar Heel Pain",
    region: "Ankle & Foot",
    bodyPart: "Ankle and Foot",
    summary:
      "Address first-step pain with morning stretching, restore calf length, then load the plantar fascia and foot intrinsics progressively.",
    caution:
      "Heel pain that is worse at night, present at rest, or accompanied by numbness or tingling in the foot needs reassessment rather than a stretching program. Where the pain is over the back of the heel rather than under it, this is the wrong protocol.",
    phases: [
      {
        name: "Phase 1 — Settle first-step pain",
        timeframe: "Roughly 0–3 weeks",
        goals: [
          "Reduce first-step morning pain",
          "Restore calf length",
          "Manage daily standing and walking load",
        ],
        criteriaToProgress: [
          "First-step pain clearly reduced",
          "Full ankle dorsiflexion range",
          "Able to walk for daily needs without a flare",
        ],
        steps: [
          { exerciseId: "plantar-fascia-stretch", dosageOverride: "3 sets of 30 s, 3x/day — including before the first steps of the morning", note: "The morning repetition is the one that changes first-step pain." },
          { exerciseId: "gastrocnemius-stretch" },
          { exerciseId: "soleus-stretch" },
          { exerciseId: "seated-heel-raise" },
          { exerciseId: "graded-activity-pacing", note: "Standing and walking volume is usually the driver." },
        ],
      },
      {
        name: "Phase 2 — Load the fascia and foot",
        timeframe: "Roughly 3–12 weeks",
        goals: [
          "Build plantar fascia and calf load tolerance",
          "Strengthen the foot intrinsics",
          "Restore normal walking tolerance",
        ],
        criteriaToProgress: [
          "Minimal or no first-step pain",
          "Symmetrical single-leg heel raises",
          "Full walking tolerance",
        ],
        steps: [
          { exerciseId: "single-leg-heel-raise", note: "With a towel under the toes to load the fascia, if the therapist has shown this variation." },
          { exerciseId: "short-foot" },
          { exerciseId: "towel-scrunch" },
          { exerciseId: "double-leg-heel-raise" },
          { exerciseId: "knee-to-wall" },
          { exerciseId: "plantar-fascia-stretch", dosageOverride: "3 sets of 30 s each morning" },
        ],
      },
      {
        name: "Phase 3 — Return to running and prevention",
        timeframe: "From roughly 12 weeks",
        goals: [
          "Return to running or standing work",
          "Maintain calf and foot strength",
        ],
        criteriaToProgress: [
          "Pain-free hopping",
          "Full running or standing work tolerance",
        ],
        steps: [
          { exerciseId: "return-to-running-progression" },
          { exerciseId: "single-leg-heel-raise", dosageOverride: "Maintenance: 3 sets, 2–3x/week" },
          { exerciseId: "short-foot" },
          { exerciseId: "single-leg-rdl" },
        ],
      },
    ],
  },
  {
    id: "hamstring-strain",
    name: "Hamstring Strain",
    region: "Hip & Pelvis",
    bodyPart: "Hip",
    summary:
      "Protect early, then load through increasing range and lengthening demand, finishing with eccentric strength and a running progression.",
    caution:
      "Reinjury rates are high when the return is rushed, and the usual reason is progressing on time rather than on criteria. A strain high up near the sitting bone, or one with significant bruising and loss of strength, needs assessment before any loading program. Return to sprinting requires symmetrical eccentric strength and pain-free maximal-speed running.",
    phases: [
      {
        name: "Phase 1 — Protect and activate",
        timeframe: "Roughly 0–1 week",
        goals: [
          "Protect the healing tissue",
          "Maintain activation without provoking the strain",
          "Normalise walking",
        ],
        criteriaToProgress: [
          "Pain-free walking",
          "Pain-free isometric hamstring contraction",
          "No pain on gentle prone knee flexion",
        ],
        steps: [
          { exerciseId: "glute-bridge", dosageOverride: "10–15 reps in a comfortable range", note: "Loads the hip extensors without lengthening the hamstring." },
          { exerciseId: "prone-hamstring-curl", dosageOverride: "10–15 reps, no added weight", note: "Short-range and pain-free only." },
          { exerciseId: "abdominal-draw-in" },
          { exerciseId: "standing-hip-march" },
          { exerciseId: "stationary-cycling", dosageOverride: "10–15 minutes, low resistance", note: "Maintain conditioning without lengthening the hamstring." },
        ],
      },
      {
        name: "Phase 2 — Load through range",
        timeframe: "Roughly 1–4 weeks",
        goals: [
          "Load the hamstring through increasing range",
          "Restore hip extensor strength",
          "Restore pain-free lengthening",
        ],
        criteriaToProgress: [
          "Pain-free single-leg bridge and single-leg hinge",
          "Symmetrical hamstring strength at mid-range",
          "Pain-free jogging",
        ],
        steps: [
          { exerciseId: "single-leg-bridge" },
          { exerciseId: "single-leg-rdl", note: "Introduce the lengthening demand gradually — bodyweight first." },
          { exerciseId: "prone-hamstring-curl", dosageOverride: "2–3 sets of 10–15 with added weight" },
          { exerciseId: "hip-hinge-dowel" },
          { exerciseId: "supine-hamstring-stretch", note: "Gentle only — a sharp or electric feeling means stop." },
          { exerciseId: "bird-dog" },
        ],
      },
      {
        name: "Phase 3 — Eccentric strength and return to sprinting",
        timeframe: "From roughly 4 weeks, criteria-dependent",
        goals: [
          "Build eccentric hamstring strength at length",
          "Return to sprinting and change of direction",
          "Reduce reinjury risk",
        ],
        criteriaToProgress: [
          "Symmetrical eccentric hamstring strength",
          "Pain-free maximal-speed running",
          "Confidence at full speed",
        ],
        steps: [
          { exerciseId: "nordic-hamstring-curl", note: "Twice weekly at most. Expect significant delayed soreness at first." },
          { exerciseId: "single-leg-rdl", dosageOverride: "2–3 sets of 8–10 with load" },
          { exerciseId: "return-to-running-progression", note: "Progress to sprinting only once maximal-effort running is pain-free." },
          { exerciseId: "pallof-press" },
          { exerciseId: "copenhagen-adduction-modified" },
        ],
      },
    ],
  },
  {
    id: "gluteal-tendinopathy",
    name: "Gluteal Tendinopathy (Lateral Hip Pain)",
    region: "Hip & Pelvis",
    bodyPart: "Hip",
    summary:
      "Remove the compressive positions first, then load the abductors isometrically and progressively without end-range adduction.",
    caution:
      "The single biggest change is usually postural rather than exercise-based: sitting cross-legged, standing hanging on one hip, and sleeping on the painful side all compress the tendon. End-range hip adduction and abduction stretches typically make this worse, which is why they are deliberately absent here.",
    phases: [
      {
        name: "Phase 1 — Remove compression, load isometrically",
        timeframe: "Roughly 0–3 weeks",
        goals: [
          "Reduce tendon compression through positional change",
          "Begin isometric abductor loading",
          "Reduce night pain",
        ],
        criteriaToProgress: [
          "Reduced night pain and pain on lying on the side",
          "Pain-free isometric abduction",
          "Able to walk for daily needs",
        ],
        steps: [
          { exerciseId: "glute-bridge", dosageOverride: "10–15 reps with the knees hip-width apart, once daily", note: "Keep the knees apart — squeezing them together compresses the tendon." },
          { exerciseId: "hip-adduction-squeeze", note: "Loads the hip without any abduction stretch." },
          { exerciseId: "standing-weight-shift" },
          { exerciseId: "sit-to-stand" },
          { exerciseId: "walking-program", dosageOverride: "Short, frequent, flat walks", note: "Avoid hills and long strides early on." },
          { exerciseId: "graded-activity-pacing", note: "Positional habits matter more here than almost anywhere else." },
        ],
      },
      {
        name: "Phase 2 — Progressive abductor loading",
        timeframe: "Roughly 3–12 weeks",
        goals: [
          "Build hip abductor strength",
          "Restore single-leg stance control",
          "Restore walking tolerance",
        ],
        criteriaToProgress: [
          "Single-leg stance for 30 seconds with a level pelvis and no pain",
          "Symmetrical abductor strength on the clinic's chosen tests",
          "Able to lie on the side comfortably",
        ],
        steps: [
          { exerciseId: "clamshell", note: "Stay well inside the range — end-range abduction can compress the tendon." },
          { exerciseId: "standing-band-hip-abduction" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "step-up" },
          { exerciseId: "single-leg-bridge" },
          { exerciseId: "sidestep-walk" },
        ],
      },
      {
        name: "Phase 3 — Function and prevention",
        timeframe: "From roughly 12 weeks",
        goals: [
          "Restore full walking, stair and hill tolerance",
          "Maintain abductor strength",
          "Prevent recurrence",
        ],
        criteriaToProgress: [
          "Full walking, hill and stair tolerance",
          "Symmetrical strength maintained",
        ],
        steps: [
          { exerciseId: "split-squat" },
          { exerciseId: "single-leg-rdl" },
          { exerciseId: "lateral-band-walk" },
          { exerciseId: "stair-climbing" },
          { exerciseId: "standing-band-hip-abduction", dosageOverride: "Maintenance: 2–3 sets, 2–3x/week" },
        ],
      },
    ],
  },
  {
    id: "hip-knee-osteoarthritis",
    name: "Hip or Knee Osteoarthritis",
    region: "Hip & Pelvis",
    bodyPart: "General Conditioning",
    summary:
      "Exercise and load management as first-line care: build strength and aerobic capacity, and manage flares without stopping the program.",
    caution:
      "Some discomfort during exercise is expected and is not a sign of damage; symptoms that stay elevated the following day mean the dose was too high. Rapidly worsening pain, night pain at rest, or a hot swollen joint needs medical reassessment rather than a change of exercise.",
    phases: [
      {
        name: "Phase 1 — Establish a baseline",
        timeframe: "Roughly 0–4 weeks",
        goals: [
          "Establish an exercise baseline that does not cause a flare",
          "Begin building lower limb strength",
          "Build confidence that movement is safe",
        ],
        criteriaToProgress: [
          "Exercising consistently without next-day flares",
          "Sit-to-stand without pushing off the arms",
          "Walking tolerance improving",
        ],
        steps: [
          { exerciseId: "sit-to-stand" },
          { exerciseId: "glute-bridge" },
          { exerciseId: "long-arc-quad" },
          { exerciseId: "clamshell" },
          { exerciseId: "stationary-cycling" },
          { exerciseId: "walking-program", note: "Set the starting duration by a bad day, not a good one." },
          { exerciseId: "graded-activity-pacing" },
        ],
      },
      {
        name: "Phase 2 — Build strength and capacity",
        timeframe: "Roughly 4–12 weeks",
        goals: [
          "Build meaningful lower limb strength",
          "Increase aerobic capacity",
          "Improve balance and reduce falls risk",
        ],
        criteriaToProgress: [
          "Clear strength gains on the clinic's chosen tests",
          "Walking 20–30 minutes comfortably",
          "Confident single-leg stance",
        ],
        steps: [
          { exerciseId: "box-squat" },
          { exerciseId: "step-up" },
          { exerciseId: "standing-band-hip-abduction" },
          { exerciseId: "double-leg-heel-raise" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "aquatic-walking", note: "A good way to add volume where land-based loading is limited." },
          { exerciseId: "walking-program" },
        ],
      },
      {
        name: "Phase 3 — Maintain",
        timeframe: "Ongoing",
        goals: [
          "Maintain strength and capacity long term",
          "Self-manage flares without stopping exercise",
        ],
        criteriaToProgress: [
          "A maintenance program the person will keep doing",
          "Confident self-management of a flare",
        ],
        steps: [
          { exerciseId: "full-body-resistance-circuit", dosageOverride: "2–3 rounds, 2–3x/week, ongoing" },
          { exerciseId: "walking-program", dosageOverride: "20–30 minutes most days, ongoing" },
          { exerciseId: "morning-mobility-flow" },
          { exerciseId: "graded-activity-pacing", note: "Reduce the dose during a flare rather than stopping altogether." },
        ],
      },
    ],
  },
  {
    id: "otago-falls-prevention",
    name: "Falls Prevention (Otago-Style)",
    region: "Neuro & Balance",
    bodyPart: "Neurological",
    summary:
      "The strength-plus-balance-plus-walking combination used in home-based falls prevention programmes, graded across three levels.",
    caution:
      "Every balance exercise here assumes a solid support within arm's reach and, early on, someone nearby. Falls risk is multifactorial — medication review, vision, footwear and home hazards sit alongside this program, not after it. A recent unexplained fall, or falls with blackouts or dizziness, needs medical assessment.",
    phases: [
      {
        name: "Level 1 — Strength and static balance",
        timeframe: "Roughly weeks 1–4",
        goals: [
          "Build lower limb strength",
          "Establish static balance with support",
          "Establish a daily walking habit",
        ],
        criteriaToProgress: [
          "Feet-together stance for 30 seconds with no hand support",
          "Sit-to-stand without using the arms",
          "Walking established most days",
        ],
        steps: [
          { exerciseId: "sit-to-stand" },
          { exerciseId: "standing-band-hip-abduction", dosageOverride: "10–15 reps each side, holding a counter" },
          { exerciseId: "double-leg-heel-raise" },
          { exerciseId: "standing-hip-march" },
          { exerciseId: "romberg-stance" },
          { exerciseId: "standing-weight-shift" },
          { exerciseId: "walking-program", dosageOverride: "Start where comfortable and build gradually, most days" },
        ],
      },
      {
        name: "Level 2 — Dynamic balance and walking variations",
        timeframe: "Roughly weeks 5–12",
        goals: [
          "Progress to narrower and single-leg stance",
          "Add walking variations",
          "Continue building strength",
        ],
        criteriaToProgress: [
          "Single-leg stance for 10–30 seconds each side",
          "Tandem walking 10 steps with fingertip support only",
          "Confident stair use",
        ],
        steps: [
          { exerciseId: "semi-tandem-stance" },
          { exerciseId: "single-leg-stance" },
          { exerciseId: "tandem-walk" },
          { exerciseId: "backward-walk" },
          { exerciseId: "sidestep-walk" },
          { exerciseId: "heel-toe-walks" },
          { exerciseId: "step-up" },
        ],
      },
      {
        name: "Level 3 — Challenge and community mobility",
        timeframe: "From roughly week 12, ongoing",
        goals: [
          "Challenge balance under realistic conditions",
          "Restore confidence outdoors and in busy environments",
          "Maintain the program long term",
        ],
        criteriaToProgress: [
          "Confident outdoor and community walking",
          "A maintenance program continuing at least three times a week",
        ],
        steps: [
          { exerciseId: "tandem-stance" },
          { exerciseId: "foam-surface-stance" },
          { exerciseId: "obstacle-step-over" },
          { exerciseId: "four-square-step" },
          { exerciseId: "reach-outside-base" },
          { exerciseId: "dual-task-balance" },
          { exerciseId: "walking-program", dosageOverride: "20–30 minutes most days, including outdoors" },
        ],
      },
    ],
  },
  {
    id: "vestibular-hypofunction",
    name: "Unilateral Vestibular Hypofunction",
    region: "Neuro & Balance",
    bodyPart: "Neurological",
    summary:
      "Gaze stabilisation and habituation combined with progressive balance and gait work, building toward busy real-world environments.",
    caution:
      "This protocol assumes a vestibular assessment has established the diagnosis — positional vertigo, which is far more common, needs a repositioning manoeuvre rather than these exercises, and central causes need different management entirely. Mild symptom provocation during the exercises is expected and is how they work; severe or long-lasting symptoms mean the dose is too high.",
    phases: [
      {
        name: "Phase 1 — Gaze stabilisation, seated",
        timeframe: "Roughly weeks 1–2",
        goals: [
          "Begin gaze stabilisation",
          "Establish static balance",
          "Build tolerance to head movement",
        ],
        criteriaToProgress: [
          "Able to complete a minute of seated gaze stabilisation with symptoms settling within minutes",
          "Feet-together stance for 30 seconds",
        ],
        steps: [
          { exerciseId: "gaze-stabilization-x1", dosageOverride: "1 minute each direction, seated, 3–5x/day", note: "Mild dizziness during this is expected and should settle within minutes." },
          { exerciseId: "romberg-stance" },
          { exerciseId: "standing-weight-shift" },
          { exerciseId: "cervical-rotation-arom", note: "A stiff, guarded neck limits the head movement these exercises depend on." },
          { exerciseId: "walking-program", dosageOverride: "Short, familiar routes to start" },
        ],
      },
      {
        name: "Phase 2 — Standing and dynamic",
        timeframe: "Roughly weeks 3–6",
        goals: [
          "Progress gaze stabilisation to standing",
          "Progress static balance",
          "Add head movement during walking",
        ],
        criteriaToProgress: [
          "Standing gaze stabilisation tolerated",
          "Semi-tandem or tandem stance for 30 seconds",
          "Walking with head turns in a straight line",
        ],
        steps: [
          { exerciseId: "gaze-stabilization-x1", dosageOverride: "1–2 minutes each direction, standing, 3–5x/day" },
          { exerciseId: "semi-tandem-stance" },
          { exerciseId: "tandem-stance" },
          { exerciseId: "head-turns-walking" },
          { exerciseId: "tandem-walk" },
          { exerciseId: "single-leg-stance" },
        ],
      },
      {
        name: "Phase 3 — Community and complex environments",
        timeframe: "From roughly week 6",
        goals: [
          "Tolerate busy visual environments",
          "Restore confident community mobility",
          "Return to work and driving where appropriate",
        ],
        criteriaToProgress: [
          "Confident walking in busy environments",
          "Full daily and work activity",
        ],
        steps: [
          { exerciseId: "foam-surface-stance" },
          { exerciseId: "head-turns-walking", dosageOverride: "Progress to busier environments" },
          { exerciseId: "dual-task-balance" },
          { exerciseId: "four-square-step" },
          { exerciseId: "reach-outside-base" },
          { exerciseId: "walking-program", dosageOverride: "Include shops and other busy environments" },
        ],
      },
    ],
  },
];

export function getMovementProtocol(id: string): MovementProtocol | undefined {
  return MOVEMENT_PROTOCOLS.find((p) => p.id === id);
}

export interface ResolvedProtocolStep {
  exercise: MovementExercise;
  /** The phase's override if it has one, otherwise the exercise's own formatted dosage. */
  dosage: string;
  note?: string;
}

/** Resolves a phase's steps into real exercises. An id that doesn't resolve is dropped
 *  rather than rendering a blank row — a missing exercise should look like a shorter list,
 *  never like a broken one. e2e/movement-lab.spec.ts asserts none are ever dropped. */
export function resolveProtocolSteps(phase: MovementProtocolPhase): ResolvedProtocolStep[] {
  const resolved: ResolvedProtocolStep[] = [];
  for (const step of phase.steps) {
    const exercise = MOVEMENT_EXERCISE_BY_ID.get(step.exerciseId);
    if (!exercise) continue;
    resolved.push({
      exercise,
      dosage: step.dosageOverride ?? formatDosage(exercise.dosage),
      note: step.note,
    });
  }
  return resolved;
}

/**
 * Turns one protocol phase into the HEP Builder's exercise rows. `notes` combines the
 * dosage's frequency-and-tempo detail with the patient-facing cue, because the builder only
 * has `sets`, `reps` and `notes` to work with and the cue is the single most useful thing a
 * patient can read on a printed program. imageUrl/videoUrl are deliberately empty — the bank
 * carries no media (see the note in types.ts), and the builder gates those fields on
 * LimbicPRO anyway.
 */
export function protocolPhaseToHepExercises(phase: MovementProtocolPhase): HepTemplateExercise[] {
  return resolveProtocolSteps(phase).map(({ exercise, dosage, note }) => {
    const dosageIsOverride = dosage !== formatDosage(exercise.dosage);
    const notes = [
      dosageIsOverride ? dosage : exercise.dosage.frequency,
      exercise.cue.replace(/^“|”$/g, ""),
      note,
    ]
      .filter(Boolean)
      .join(" — ");
    return {
      name: exercise.name,
      sets: dosageIsOverride ? "" : exercise.dosage.sets,
      reps: dosageIsOverride ? "" : exercise.dosage.reps,
      // Not something a protocol phase specifies — see HepTemplateExercise's own comment in
      // lib/hep-templates.ts on why that's fine (dashboard-only, optional context).
      weight: "",
      notes,
      imageUrl: "",
      videoUrl: "",
    };
  });
}
