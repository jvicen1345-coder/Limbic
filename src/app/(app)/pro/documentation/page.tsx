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
[Orientation]. [Attention/memory]. [Safety awareness]. TODO: expand cognitive screening detail.

COMMUNICATION
[Expressive/receptive status]. [Augmentative communication needs]. TODO: expand detail.

TONE AND REFLEXES
[Tone findings by region]. [Deep tendon reflexes]. [Pathological reflexes]. TODO: expand detail.

COORDINATION
[Finger to nose, heel to shin, rapid alternating movements]. TODO: expand detail.

FUNCTIONAL MOBILITY
[Bed mobility]. [Transfers]. [Gait, with device if applicable]. [Balance]. TODO: expand detail.

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
[Progress toward each active goal since last progress note]. TODO: expand template.

OBJECTIVE MEASUREMENTS
[Current measurements] compared to [prior measurements/baseline]. TODO: expand template.

GOAL ACHIEVEMENT
[X]% of short-term goals met. [X]% of long-term goals met. TODO: expand template.

PLAN
[Continue current plan of care] or [Recommend discharge]. [Rationale]. TODO: expand template.`;

const DISCHARGE_SUMMARY = `REASON FOR DISCHARGE
[Goals met / Plateau reached / Patient request / Insurance exhausted]. TODO: expand template.

GOALS ACHIEVED
[List goals met and not met]. TODO: expand template.

FUNCTIONAL STATUS AT DISCHARGE
[Current functional level compared to initial evaluation]. TODO: expand template.

HOME EXERCISE PROGRAM PROVIDED
[Summary of HEP provided, see attached]. TODO: expand template.

REFERRALS MADE
[Referrals made, if any]. TODO: expand template.

PATIENT EDUCATION PROVIDED
[Education topics covered]. TODO: expand template.`;

const PRIOR_AUTH_LETTER = `[Date]

[Insurance company name]
[Address]

RE: Prior Authorization Request for [Patient name], DOB [date of birth], Member ID [ID]

PATIENT INFORMATION
[Patient name], [DOB], [diagnosis code(s)]. TODO: expand template.

DIAGNOSIS
[Primary diagnosis and relevant secondary diagnoses]. TODO: expand template.

FUNCTIONAL LIMITATIONS
[Specific functional limitations impacting daily life]. TODO: expand template.

TREATMENT PLAN
[Proposed frequency, duration, and interventions]. TODO: expand template.

MEDICAL NECESSITY STATEMENT
[Why continued/additional physical therapy is medically necessary]. TODO: expand template.

SUPPORTING EVIDENCE
[Reference to relevant clinical practice guidelines or outcome measure scores]. TODO: expand template.

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
