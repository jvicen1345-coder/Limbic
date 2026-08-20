import { getCurrentUser } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { DocTemplateCard } from "@/components/pro/documentation/DocTemplateCard";
import { FunctionalGoalsBank } from "@/components/pro/documentation/FunctionalGoalsBank";

const INITIAL_EVAL_ORTHO = `CHIEF COMPLAINT
[Patient name] presents with [chief complaint], onset [date of onset].

HISTORY OF PRESENT ILLNESS
[Mechanism of injury/onset]. [Prior treatment]. [Aggravating factors]. [Easing factors].

PAST MEDICAL HISTORY
[Relevant medical history]. [Prior surgeries]. [Current medications].

SOCIAL HISTORY
[Occupation]. [Living situation]. [Prior level of function]. [Support system].

SYSTEMS REVIEW
Cardiopulmonary: [findings]
Musculoskeletal: [findings]
Neuromuscular: [findings]
Integumentary: [findings]

TESTS AND MEASURES
Range of motion: [findings]
Strength: [findings]
Special tests: [findings]
Palpation: [findings]
Functional testing: [findings]

ASSESSMENT
[Clinical impression]. [PT diagnosis]. Rehab potential: [good/fair/poor].

PLAN
Frequency: [x]x/week for [x] weeks
Interventions: [list]
Short-term goals: [list]
Long-term goals: [list]`;

const INITIAL_EVAL_NEURO = `CHIEF COMPLAINT
[Patient name] presents with [chief complaint], onset [date of onset].

HISTORY OF PRESENT ILLNESS
[Diagnosis/mechanism]. [Course since onset]. [Prior level of function].

PAST MEDICAL HISTORY
[Relevant medical history]. [Current medications].

COGNITIVE STATUS
[Orientation to person/place/time/situation]. [Attention span, e.g. digit span or serial 7s]. [Short- and long-term memory]. [Safety awareness and judgment]. [Standardized screen used, e.g. MoCA or SLUMS, and score if administered].

COMMUNICATION
[Expressive and receptive language status]. [Dysarthria or apraxia of speech, if present]. [Augmentative and alternative communication needs]. [Ability to follow single- vs multi-step commands].

TONE AND REFLEXES
[Tone findings by region, e.g. Modified Ashworth Scale grade]. [Deep tendon reflexes, graded 0-4+]. [Pathological reflexes, e.g. Babinski, clonus]. [Symmetry of findings side to side].

COORDINATION
[Finger to nose, heel to shin, rapid alternating movements]. [Dysmetria or dysdiadochokinesia, if present]. [Standardized measure if used, e.g. SARA].

FUNCTIONAL MOBILITY
[Bed mobility, e.g. rolling, supine-to-sit, with assist level]. [Transfers, e.g. sit-to-stand, bed-to-chair, with assist level]. [Gait, with device and assist level if applicable, including distance and quality]. [Static and dynamic balance]. [Stair negotiation, if assessed].

ASSESSMENT
[Clinical impression]. Rehab potential: [good/fair/poor].

PLAN
Frequency: [x]x/week for [x] weeks
Interventions: [list]
Short-term goals: [list]
Long-term goals: [list]`;

const DAILY_SOAP = `S: Patient reports [pain level] [functional status update].

O: [Interventions provided] [Response to treatment].

A: [Progress toward goals] [Barriers].

P: [Next session plan].`;

const PROGRESS_NOTE = `FUNCTIONAL PROGRESS
[Progress toward each active short- and long-term goal since the last progress note, with objective comparison where possible].

OBJECTIVE MEASUREMENTS
[Current measurements, e.g. ROM, strength, or outcome measure scores] compared to [prior measurements or evaluation baseline].

GOAL ACHIEVEMENT
[X]% of short-term goals met, [list which]. [X]% of long-term goals met, [list which]. [Any goals requiring revision, with rationale].

PLAN
[Continue current plan of care] or [modify frequency/duration] or [recommend discharge]. [Rationale based on progress and remaining barriers]. [Planned interventions for the next certification period].`;

const DISCHARGE_SUMMARY = `REASON FOR DISCHARGE
[Goals met] / [Plateau reached, maximum functional benefit achieved] / [Patient request] / [Insurance authorization exhausted] / [Non-adherence]. [Supporting rationale].

GOALS ACHIEVED
[List each short- and long-term goal with met/not met status; for goals not met, include the reason].

FUNCTIONAL STATUS AT DISCHARGE
[Current functional level, with objective measures] compared to [initial evaluation baseline]. [Any remaining limitations].

HOME EXERCISE PROGRAM PROVIDED
[Summary of HEP provided, see attached]. [Instructions for progression]. [Equipment issued, if any].

REFERRALS MADE
[Referrals made, if any, e.g. to another discipline, physician follow-up, or community program]. [Reason for referral].

PATIENT EDUCATION PROVIDED
[Education topics covered, e.g. home safety, activity modification, self-management strategies]. [Patient/caregiver understanding verified].`;

const PRIOR_AUTH_LETTER = `[Date]

[Insurance company name]
[Address]

RE: Prior Authorization Request for [Patient name], DOB [date of birth], Member ID [ID]

PATIENT INFORMATION
[Patient name], [DOB], [diagnosis code(s), ICD-10].

DIAGNOSIS
[Primary diagnosis and relevant secondary diagnoses, with ICD-10 codes].

FUNCTIONAL LIMITATIONS
[Specific functional limitations impacting daily life, tied to objective measures from the evaluation].

TREATMENT PLAN
[Proposed frequency, duration, and interventions, with clinical rationale for each].

MEDICAL NECESSITY STATEMENT
[Why continued/additional physical therapy is medically necessary, including why a less-intensive alternative is not appropriate and the expected functional gains].

SUPPORTING EVIDENCE
[Reference to relevant clinical practice guidelines, e.g. APTA CPGs, or objective outcome measure scores demonstrating progress and potential for further improvement].

Sincerely,
[Clinician name, credentials]`;

export default async function ProDocumentationPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Documentation Templates</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Evidence-based templates for PT documentation, copy, customize, and use.
      </p>

      {!user.isPro ? (
        <ProGate toolName="Documentation Templates" />
      ) : (
        <div className="pro-grid-2">
          <DocTemplateCard
            name="Initial Evaluation, Outpatient Orthopedic"
            description="Full SOAP-format initial evaluation for an outpatient orthopedic visit."
            format="SOAP"
            body={INITIAL_EVAL_ORTHO}
          />
          <DocTemplateCard
            name="Initial Evaluation, Neurological"
            description="SOAP-format initial evaluation with neuro-specific sections."
            format="SOAP"
            body={INITIAL_EVAL_NEURO}
          />
          <DocTemplateCard name="Daily SOAP Note" description="Compact daily treatment note." format="SOAP" body={DAILY_SOAP} />
          <DocTemplateCard
            name="Progress Note"
            description="Functional progress toward goals and continued plan of care."
            format="Narrative"
            body={PROGRESS_NOTE}
          />
          <DocTemplateCard
            name="Discharge Summary"
            description="Summary of goals achieved, functional status, and HEP at discharge."
            format="Narrative"
            body={DISCHARGE_SUMMARY}
          />
          <FunctionalGoalsBank />
          <DocTemplateCard
            name="Prior Authorization Letter"
            description="Formal letter template for insurance prior authorization requests."
            format="Letter"
            body={PRIOR_AUTH_LETTER}
          />
        </div>
      )}
    </div>
  );
}
