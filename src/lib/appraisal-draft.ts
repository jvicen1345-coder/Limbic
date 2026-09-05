import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { SOURCE_ACCESS_LABELS, type AppraisalCheck, type AppraisalInput } from "@/lib/appraisal";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * Drafts the prose for one appraisal (see app/(app)/admin/appraisals, lib/appraisal.ts).
 *
 * What this function is given is the entire point. It receives the appraiser's typed
 * fields and the deterministic checks computed from them — nothing else. It never sees the
 * paper: not the PDF, not the abstract, not a fetched page. There is no code path here that
 * could send publisher text to a model, which is what keeps the feature clear of the
 * subscriber terms that prohibit uploading licensed articles to AI services, and clear of
 * reproducing an author's expression. Facts and numbers go in; the appraiser's own framing
 * comes back developed into readable prose.
 *
 * The model's job is expression, not judgment. Every verdict a reader sees was already
 * decided by arithmetic in runAppraisalChecks() before this call was made, and the checks
 * are handed over as settled findings the prose must agree with — so the paragraphs can
 * never quietly disagree with the numbers printed beside them. The one place a point of
 * view enters is the appraiser's own notes, which the prompt treats as the editorial line
 * to develop rather than as raw material to neutralise.
 *
 * Same Anthropic client/structured-output pattern as the app's other single-turn tools
 * (lib/generalizability-score.ts, lib/article-breakdown.ts, lib/article-variables.ts) — one
 * call, a zod-parsed response, no chat loop. Nothing is cached: an appraisal is drafted a
 * handful of times while it is being written and then never again.
 */

const SYSTEM_PROMPT = [
  "You draft short research appraisals for physical therapy clinicians, writing for Limbic, a platform run by a Doctor of Physical Therapy student who reads each paper personally before appraising it.",
  "",
  "You have NOT read the study. You are given only structured fields the appraiser typed in after reading it, plus a set of checks already computed from those numbers. Write only from what you are given.",
  "",
  "Hard rules about the facts:",
  "- Never state a number that is not in the fields you were given. If something is marked not reported, either say it was not reported or leave it out — never estimate, infer, or fill a gap.",
  "- The computed checks are settled findings, not suggestions. Your prose must agree with every one of them. If a check says the effect is smaller than the MCID, the paragraphs say so plainly; do not soften it, and do not lead with statistical significance as though it settled the question.",
  "- Never reproduce or paraphrase the study's own sentences — you do not have them, so there is nothing to copy. Use the appraiser's phrasing and your own.",
  "",
  "The appraiser's notes carry the point of view. That is the piece's reason to exist: develop the argument they made, in their voice, in the first person where it reads naturally. Do not flatten it into a neutral summary, and do not contradict it — if their take sits awkwardly with a computed check, write the tension honestly rather than picking a side.",
  "",
  "Structure: a one- or two-sentence summary for the feed card, then three to five short paragraphs. The arc is what the study did, what it found with the actual numbers, what that means for practice, and what would change the reading. Each paragraph is two to four sentences. No headings, no bullet lists, no markdown.",
  "",
  "Register: plain, direct, specific. A clinician reading between patients. Never breathless, never hedged into meaninglessness. Numbers belong in the prose, not just in the table beside it.",
  "",
  "Hard rules about scope: never state or imply a diagnosis, never recommend a medication, dosage, or treatment decision for a specific patient. This is evidence appraisal — it describes what the evidence supports, it does not tell a clinician what to do. Never invent a citation.",
  "",
  "Respond only in the requested structured format. No preamble, no markdown.",
].join("\n");

/* Array length is instructed in the prompt and expressed in .describe() text rather than as
   a zod .min()/.max() constraint, for the same reason lib/generalizability-score.ts spells
   its counts out in prose: zodOutputFormat demotes most length constraints to schema
   description text (see lib/transform-json-schema.js), so a strict constraint here would
   buy no server-side enforcement while making safeParse *throw* on a four-paragraph
   response that was perfectly usable. */
const DraftSchema = z.object({
  summary: z.string().describe("One or two sentences for the feed card. States what the study found and the appraiser's line on it."),
  paragraphs: z
    .array(z.string())
    .min(1)
    .describe("Three to five paragraphs of two to four sentences each. Plain prose, no headings or markdown."),
});

export interface AppraisalDraft {
  summary: string;
  paragraphs: string[];
}

export const DRAFT_FAILED_MESSAGE =
  "Could not draft this appraisal. Check that the study details and your notes are filled in, then try again.";

/** Renders one labelled line, or nothing at all when the value is empty — a field the
 *  appraiser left blank should reach the model as absent rather than as "unknown", which
 *  reads as a fact about the study rather than a gap in the entry. */
function line(label: string, value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? `${label}: ${text}` : null;
}

function buildStudyBrief(input: AppraisalInput, checks: AppraisalCheck[]): string {
  const effect =
    input.effectPoint === null
      ? null
      : [
          `${input.effectPoint}${input.effectUnit ? ` ${input.effectUnit}` : ""}`,
          input.effectCiLower !== null && input.effectCiUpper !== null
            ? `(95% CI ${input.effectCiLower} to ${input.effectCiUpper})`
            : null,
          input.pValue.trim() ? `p ${input.pValue.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" ");

  const sections: (string | null)[] = [
    "STUDY",
    line("Title", input.title),
    line("Authors", input.authors),
    line("Journal", input.journal),
    line("Year", input.year),
    line("Design", input.design),
    "",
    "WHO AND WHAT",
    line("Population", input.population),
    line("Setting", input.setting),
    line("Intervention", input.intervention),
    line("Comparator", input.comparator),
    line("Follow-up (weeks)", input.followUpWeeks),
    line("Randomised", input.nRandomised),
    line("Analysed", input.nAnalysed),
    "",
    "PRIMARY OUTCOME",
    line("Measure", input.primaryOutcomeName),
    line("Effect", effect),
    line("Effect type", input.effectMeasure === "ratio" ? "ratio measure" : "difference measure"),
    line("Published MCID", input.mcid === null ? null : `${input.mcid}${input.effectUnit ? ` ${input.effectUnit}` : ""}`),
    line("MCID source", input.mcidSource),
    "",
    "INTEGRITY",
    line("Registration", input.registered ? input.registrationId || "registered" : "not registered"),
    input.registered && input.primaryOutcomeChanged ? "Primary outcome: differs from the registered one" : null,
    line("Funding", input.fundingSource),
    line("Conflicts declared", input.conflictsDeclared ? "yes" : "no"),
    "",
    "COMPUTED CHECKS — these are settled. Your prose must agree with them.",
    ...checks.map((c) => `- ${c.label} [${c.verdict}]: ${c.detail}`),
    "",
    `HOW THE APPRAISER READ IT: ${SOURCE_ACCESS_LABELS[input.sourceAccess]}`,
    input.sourceAccess === "abstract_only"
      ? "They had the abstract only — do not write as though the methods or the flow diagram were examined."
      : null,
    "",
    "THE APPRAISER'S OWN TAKE — this is the argument to develop:",
    input.notes.trim(),
  ];

  return sections.filter((s) => s !== null).join("\n");
}

/** Drafts prose from the entered fields. Returns null on any failure; the caller turns that
 *  into the editor's error state, leaving whatever the appraiser had already written
 *  untouched. */
export async function draftAppraisal(input: AppraisalInput, checks: AppraisalCheck[]): Promise<AppraisalDraft | null> {
  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 4096,
      // "low" effort matches the app's other structured-output tools — see lib/agent.ts on
      // why higher effort levels interact badly with strict structured-output parsing.
      output_config: { effort: "low", format: zodOutputFormat(DraftSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Draft an appraisal from these entered details:\n\n${buildStudyBrief(input, checks)}`,
        },
      ],
    });

    const parsed = message.parsed_output;
    if (!parsed) return null;

    const paragraphs = parsed.paragraphs.map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length === 0) return null;

    return { summary: parsed.summary.trim(), paragraphs };
  } catch (err) {
    console.error("Appraisal drafting failed:", err);
    return null;
  }
}
