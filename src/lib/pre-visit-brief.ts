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
