import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
// See lib/agent.ts for the same constant — kept as a literal here too since this module
// has no other reason to import from agent.ts (different system prompts, different call
// shape), not because the model choice differs.
const MODEL = "claude-opus-5";

const CLINICAL_SYSTEM_PROMPT = `You are a clinical decision support tool for licensed physical therapists. You generate concise pre-visit clinical briefs to help a PT prepare for a patient session. You never provide a diagnosis. You never give medical advice. You are a starting point for clinical reasoning — not a replacement for it.

Generate a pre-visit brief in exactly 3 sentences:
Sentence 1 — summarize where the patient is in their plan of care based on visit count and condition
Sentence 2 — note any outcome measure trend if scores are available — improving, plateauing, or declining
Sentence 3 — suggest one evidence-based clinical consideration for this visit based on the condition and visit stage

Keep language clinical and precise. No filler. No disclaimers in the brief itself.`;

const PATIENT_SYSTEM_PROMPT = `You are a physical therapy assistant helping a licensed PT communicate progress to their patient in plain, encouraging language. You write patient-facing summaries that are warm, clear, and motivating.

Write a patient-facing progress summary in exactly 3 short paragraphs:

Paragraph 1 — Where they are in their recovery. Reference the visit number and condition in plain language. No medical jargon. Encouraging tone.

Paragraph 2 — How they are progressing. If outcome measure scores are available reference improvement in plain terms — do not cite the score numbers directly, describe the trend. If no scores available — acknowledge the effort and consistency.

Paragraph 3 — What to focus on this week. One or two specific action-oriented sentences about their home program and what matters most right now.

Keep the total length under 120 words. Write directly to the patient — use "you" and "your". Never include a diagnosis. Never give medical advice. Always encourage them to contact their PT with questions.`;

export interface BriefPatientInput {
  patientCode: string;
  condition: string;
  bodyRegion: string;
  visitCount: number;
  totalVisits: number;
  outcomes: { measureName: string; score: number; maxScore: number; recordedAt: Date }[];
  lastHEP?: string;
}

function summarizeOutcomes(outcomes: BriefPatientInput["outcomes"]): string {
  if (outcomes.length === 0) return "No outcome measures recorded yet";
  return outcomes
    .map((o) => `${o.measureName}: ${o.score}/${o.maxScore} on ${new Date(o.recordedAt).toLocaleDateString()}`)
    .join(", ");
}

/** The clinician-facing pre-visit brief (see PreVisitBrief.patientFacing = false in
 *  schema.prisma) — generateClinicalBriefAction in app/actions/clinician-dashboard.ts is
 *  the only caller. Returns null on any failure (rate limit, network, an unexpected
 *  response shape) rather than throwing, so the dashboard can show a plain "try again"
 *  state instead of a crashed page — same reasoning as lib/agent.ts's own UNAVAILABLE
 *  handling, just without that module's structured-output parsing to fail on. */
export async function generateClinicalBrief(patient: BriefPatientInput): Promise<string | null> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: CLINICAL_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a pre-visit brief for this patient:
Patient code: ${patient.patientCode}
Condition: ${patient.condition}
Body region: ${patient.bodyRegion}
Visit: ${patient.visitCount} of ${patient.totalVisits}
Outcome measures: ${summarizeOutcomes(patient.outcomes)}
${patient.lastHEP ? `Current HEP: ${patient.lastHEP}` : ""}

Return only the 3 sentence brief. No labels. No extra text.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return null;
    return content.text.trim();
  } catch (error) {
    console.error("Clinical brief generation failed:", error);
    return null;
  }
}

/** The patient-facing progress summary reviewed in Step 1 of the "Prepare for Patient"
 *  modal (see components/pro/PreparePatientModal.tsx) before a clinician confirms it via
 *  confirmPatientBrief — never saved directly, since the clinician may edit the returned
 *  text before confirming. */
export async function generatePatientBrief(patient: BriefPatientInput): Promise<string | null> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: PATIENT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a patient-facing summary for this patient:
Condition: ${patient.condition}
Body region: ${patient.bodyRegion}
Visit: ${patient.visitCount} of ${patient.totalVisits}
Outcome measures: ${summarizeOutcomes(patient.outcomes)}
${patient.lastHEP ? `Current HEP: ${patient.lastHEP}` : ""}

Return only the 3 paragraph summary. No labels. No extra text.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return null;
    return content.text.trim();
  } catch (error) {
    console.error("Patient brief generation failed:", error);
    return null;
  }
}

const TREATMENT_IDEAS_SYSTEM_PROMPT = `You are a clinical decision support tool for licensed physical therapists. You suggest evidence-based treatment ideas for specific patient presentations. You never diagnose. You never replace clinical judgment. You provide evidence-based starting points only.

Return exactly 3 treatment ideas as a JSON array of strings. Each idea is one sentence — specific, actionable, evidence-based. Reference the visit stage and any outcome trends. No numbering. No extra text. Just the JSON array.`;

/** Strips a ```json ... ``` (or bare ```) code fence if the model wrapped its JSON array
 *  in one despite TREATMENT_IDEAS_SYSTEM_PROMPT saying not to — cheap defensive parse, not
 *  a full markdown parser. */
function stripCodeFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : text;
}

/** "What should I try next?" on the active patient workspace (see
 *  components/pro/dashboard/TreatmentIdeasCard.tsx and generateTreatmentIdeas in
 *  app/actions/clinician-dashboard.ts, which is what persists the result to
 *  TreatmentIdea). Reuses BriefPatientInput — same patient shape the pre-visit brief
 *  functions above already take. */
export async function generateTreatmentIdeas(patient: BriefPatientInput): Promise<string[] | null> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: TREATMENT_IDEAS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Suggest 3 evidence-based treatment ideas for this patient:
Condition: ${patient.condition}
Body region: ${patient.bodyRegion}
Visit: ${patient.visitCount} of ${patient.totalVisits}
Outcomes: ${summarizeOutcomes(patient.outcomes)}

Return only a JSON array of 3 strings.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return null;
    const parsed = JSON.parse(stripCodeFence(content.text));
    if (!Array.isArray(parsed) || !parsed.every((idea) => typeof idea === "string")) return null;
    return parsed;
  } catch (error) {
    console.error("Treatment idea generation failed:", error);
    return null;
  }
}

export interface DischargeSummaryPatientInput {
  patientCode: string;
  condition: string;
  bodyRegion: string;
  visitCount: number;
  totalVisits: number;
  outcomes: { measureName: string; score: number; maxScore: number; recordedAt: Date }[];
  goals: { goalText: string; status: string }[];
  lastHEP?: string;
}

const DISCHARGE_SUMMARY_SYSTEM_PROMPT = `You are a clinical documentation assistant for licensed physical therapists. You generate concise discharge summaries based on patient data. The summary is clinical in tone and written for the clinician to review and confirm before use.

Write a discharge summary in exactly 3 paragraphs:
Paragraph 1 — Patient presentation and plan of care summary. Condition, total visits completed, overall episode description.
Paragraph 2 — Functional outcomes and goal achievement. Reference outcome measure trends if available. State whether goals were met, partially met, or not met.
Paragraph 3 — Discharge status and home program. Functional status at discharge, what the patient is being discharged to, home program instructions if applicable.

Clinical language. Precise. No filler. Under 150 words total.`;

/** "Generate Discharge Summary" inside the "Before You Discharge" modal (see
 *  DischargeModal.tsx and generateDischargeSummaryAction in
 *  app/actions/clinician-dashboard.ts, which is what saves the (still-unconfirmed) result
 *  to DischargeSummary). */
export async function generateDischargeSummary(patient: DischargeSummaryPatientInput): Promise<string | null> {
  try {
    const outcomeSummary =
      patient.outcomes.length > 0
        ? patient.outcomes.map((o) => `${o.measureName}: ${o.score}/${o.maxScore} recorded ${new Date(o.recordedAt).toLocaleDateString()}`).join(", ")
        : "No outcome measures recorded";

    const goalSummary =
      patient.goals.length > 0 ? patient.goals.map((g) => `${g.goalText} — ${g.status}`).join(". ") : "No formal goals recorded";

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: DISCHARGE_SUMMARY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a discharge summary for this patient:
Patient code: ${patient.patientCode}
Condition: ${patient.condition}
Body region: ${patient.bodyRegion}
Total visits completed: ${patient.visitCount} of ${patient.totalVisits} planned
Outcome measures: ${outcomeSummary}
Goals: ${goalSummary}
${patient.lastHEP ? `Home program: ${patient.lastHEP}` : ""}

Return only the 3 paragraph summary.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return null;
    return content.text.trim();
  } catch (error) {
    console.error("Discharge summary generation failed:", error);
    return null;
  }
}
