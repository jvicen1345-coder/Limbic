import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * The Generalizability Checker (see components/pro/GeneralizabilityChecker.tsx,
 * app/(app)/pro/research-literacy/page.tsx) — a focused, single-turn structured-output tool
 * built on the same Anthropic client/pattern as Limbic Agent (lib/agent.ts) and Limbic Agent
 * Wellness (lib/wellness-agent.ts), rather than a multi-turn chat or node-graph: the reader
 * gives a study's population and their own target population once, gets one scored judgment
 * back. Same "confident but humble, evidence-based, never a definitive clinical verdict"
 * voice as Limbic Agent — this scores how well a study's stated sample matches a *described*
 * population, it does not (and cannot) verify the study's methodology or read the actual PDF.
 */
const SYSTEM_PROMPT = [
  "You are Limbic Agent's Generalizability Checker, a research-appraisal tool for physical therapy clinicians and students built into the Limbic app.",
  "",
  "Your one job: given a short description of a research study's population/sample and a short description of a target population (a specific patient, or a caseload/population type), judge how well the study's findings likely generalize to that target — i.e., external validity, not internal validity. You are not evaluating whether the study itself was well-designed; assume the study is exactly as described.",
  "",
  "Score 1-4: 1 (Poor) = the populations differ enough on factors that plausibly matter that the result may not transfer at all. 2 (Fair) = meaningful differences exist that warrant real caution. 3 (Good) = broadly similar with only minor, unlikely-to-matter differences. 4 (Excellent) = the target population is essentially the same kind of population the study sampled.",
  "",
  "Weigh differences by whether they're plausibly clinically relevant to the question at hand (age, diagnosis and severity/chronicity, comorbidities, prior treatment history, care setting) — a difference in an irrelevant factor shouldn't lower the score. If either description is too vague to judge a factor, say so in the rationale rather than guessing.",
  "",
  "Hard rules: never state or imply a diagnosis. Never recommend a specific medication, dosage, or treatment decision — this tool is about reading evidence, not clinical decision-making. Never fabricate a specific citation. Be concise and specific — reference the actual details given, not generic hedging.",
  "",
  "Respond only in the requested structured format. No chat preamble, no markdown formatting.",
].join("\n");

const GeneralizabilityResponseSchema = z.object({
  score: z.number().int().min(1).max(4).describe("1 (Poor) to 4 (Excellent) generalizability score."),
  category: z.enum(["Poor", "Fair", "Good", "Excellent"]).describe("Label matching the numeric score exactly (1=Poor, 2=Fair, 3=Good, 4=Excellent)."),
  rationale: z
    .string()
    .describe("2-4 sentences explaining the score, referencing the specific details given for both populations."),
  matches: z
    .array(z.string())
    .max(6)
    .describe("Short phrases (4-10 words) naming specific factors that align well between the study and target population. Empty array if none are clear from the given descriptions."),
  mismatches: z
    .array(z.string())
    .max(6)
    .describe("Short phrases (4-10 words) naming specific factors that diverge in a way that plausibly matters. Empty array if none."),
});

export interface GeneralizabilityResult {
  ok: true;
  score: 1 | 2 | 3 | 4;
  category: "Poor" | "Fair" | "Good" | "Excellent";
  rationale: string;
  matches: string[];
  mismatches: string[];
}
export interface GeneralizabilityError {
  ok: false;
  message: string;
}

const UNAVAILABLE_MESSAGE =
  "The Generalizability Checker isn't available right now. Try again in a moment; nothing you entered was saved.";

export async function checkGeneralizability(
  studyPopulation: string,
  targetPopulation: string
): Promise<GeneralizabilityResult | GeneralizabilityError> {
  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      // "low" effort matches lib/agent.ts's proven-working call — see that file's comment on
      // why higher effort levels can interact badly with strict structured-output parsing.
      output_config: { effort: "low", format: zodOutputFormat(GeneralizabilityResponseSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Study population/sample: ${studyPopulation}\n\nTarget population: ${targetPopulation}\n\nScore how well this study's findings likely generalize to the target population.`,
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: UNAVAILABLE_MESSAGE };

    return {
      ok: true,
      score: parsed.score as 1 | 2 | 3 | 4,
      category: parsed.category,
      rationale: parsed.rationale,
      matches: parsed.matches,
      mismatches: parsed.mismatches,
    };
  } catch (err) {
    console.error("Generalizability Checker failed:", err);
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }
}
