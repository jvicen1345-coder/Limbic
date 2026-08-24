import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { resolvePubmedAbstract } from "@/lib/pubmed";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * The Generalizability Checker (see components/pro/GeneralizabilityChecker.tsx,
 * app/(app)/pro/research-literacy/page.tsx) — a focused, single-turn structured-output tool
 * built on the same Anthropic client/pattern as Limbic Agent (lib/agent.ts) and Limbic Agent
 * Wellness (lib/wellness-agent.ts), rather than a multi-turn chat or node-graph: the reader
 * gives a study (a link/PMID/DOI/citation, or a plain description of its population) and
 * their own target population once, gets one scored judgment back. Same "confident but
 * humble, evidence-based, never a definitive clinical verdict" voice as Limbic Agent — this
 * scores how well a study's population matches a *described* target, it does not verify the
 * study's methodology.
 *
 * The study side resolves through lib/pubmed.ts's resolvePubmedAbstract first (a PubMed
 * link, bare PMID, DOI, or citation/title text all resolve to a real fetched abstract via
 * NCBI's E-utilities, no scraping of arbitrary journal sites, which are frequently paywalled
 * or JS-rendered and unreliable to scrape anyway) — if that fails to resolve anything, the
 * raw input is passed straight through as a population description, same as the original
 * manual-entry-only version of this tool. That fallback means a reader can still just type a
 * plain-English population description and get the same result as before; nothing about
 * adding link support narrows what already worked.
 */
const SYSTEM_PROMPT = [
  "You are Limbic Agent's Generalizability Checker, a research-appraisal tool for physical therapy clinicians and students built into the Limbic app.",
  "",
  "Your one job: judge how well a research study's findings likely generalize — external validity, not internal validity — to a target population (a specific patient, or a caseload/population type) the reader describes. You are not evaluating whether the study itself was well-designed; assume it is exactly as described.",
  "",
  "You'll be given either a real PubMed abstract to read, or a reader's own plain-language description of a study's population — either way, first identify the study's actual population/sample (age range, diagnosis and severity/chronicity, comorbidities, setting, notable inclusion/exclusion criteria, sample size if given) before comparing it to the target.",
  "",
  "Score 1-4: 1 (Poor) = the populations differ enough on factors that plausibly matter that the result may not transfer at all. 2 (Fair) = meaningful differences exist that warrant real caution. 3 (Good) = broadly similar with only minor, unlikely-to-matter differences. 4 (Excellent) = the target population is essentially the same kind of population the study sampled.",
  "",
  "Weigh differences by whether they're plausibly clinically relevant to the question at hand (age, diagnosis and severity/chronicity, comorbidities, prior treatment history, care setting) — a difference in an irrelevant factor shouldn't lower the score. If the study description (abstract or reader-written) doesn't give you enough to judge a factor, say so in the rationale rather than guessing.",
  "",
  "When the study's population is summarized with a mean (e.g. 'mean age 49'), consider whether that mean could be masking a heterogeneous or bimodal sample rather than describing anyone real — a wide reported range, or language suggesting distinct enrolled subgroups (e.g. separate young-adult and older-adult cohorts pooled together), means the target population should be compared against whichever subgroup it actually resembles, not the pooled average. Say so in the rationale when you suspect this.",
  "",
  "Hard rules: never state or imply a diagnosis. Never recommend a specific medication, dosage, or treatment decision — this tool is about reading evidence, not clinical decision-making. Never fabricate a specific citation or detail not present in what you were given. Be concise and specific — reference the actual details given, not generic hedging.",
  "",
  "Respond only in the requested structured format. No chat preamble, no markdown formatting.",
].join("\n");

const GeneralizabilityResponseSchema = z.object({
  score: z.number().int().min(1).max(4).describe("1 (Poor) to 4 (Excellent) generalizability score."),
  category: z.enum(["Poor", "Fair", "Good", "Excellent"]).describe("Label matching the numeric score exactly (1=Poor, 2=Fair, 3=Good, 4=Excellent)."),
  studyPopulationSummary: z
    .string()
    .describe("1-2 sentence summary of the study's population/sample as you identified it — from the abstract if one was given, or restating the reader's own description."),
  rationale: z
    .string()
    .describe("2-4 sentences explaining the score, referencing the specific details given for both populations."),
  matches: z
    .array(z.string())
    .max(6)
    .describe("Short phrases (4-10 words) naming specific factors that align well between the study and target population. Empty array if none are clear."),
  mismatches: z
    .array(z.string())
    .max(6)
    .describe("Short phrases (4-10 words) naming specific factors that diverge in a way that plausibly matters. Empty array if none."),
});

export interface ResolvedStudyArticle {
  title: string;
  journal: string;
  url: string;
}

export interface GeneralizabilityResult {
  ok: true;
  score: 1 | 2 | 3 | 4;
  category: "Poor" | "Fair" | "Good" | "Excellent";
  studyPopulationSummary: string;
  rationale: string;
  matches: string[];
  mismatches: string[];
  /** Set when studyInput resolved to a real PubMed record — lets the UI show "Found: <title>,
   *  <journal>" with a link back to the source, so the reader can confirm this is really the
   *  article they meant before trusting the score. Null when studyInput was used as a raw
   *  population description instead (nothing resolved, or it was never link-shaped). */
  resolvedArticle: ResolvedStudyArticle | null;
}
export interface GeneralizabilityError {
  ok: false;
  message: string;
}

const UNAVAILABLE_MESSAGE =
  "The Generalizability Checker isn't available right now. Try again in a moment; nothing you entered was saved.";

export async function checkGeneralizability(
  studyInput: string,
  targetPopulation: string
): Promise<GeneralizabilityResult | GeneralizabilityError> {
  try {
    const resolved = await resolvePubmedAbstract(studyInput);

    const studySection = resolved
      ? resolved.abstract
        ? `Study abstract, fetched from PubMed (title: "${resolved.title}", journal: ${resolved.journal}):\n${resolved.abstract}`
        : `Found a matching PubMed record (title: "${resolved.title}", journal: ${resolved.journal}) but no abstract is on file for it — work only from the title, and say in the rationale that the population couldn't be fully determined.`
      : `Study population/sample, as described by the reader: ${studyInput}`;

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
          content: `${studySection}\n\nTarget population: ${targetPopulation}\n\nScore how well this study's findings likely generalize to the target population.`,
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: UNAVAILABLE_MESSAGE };

    return {
      ok: true,
      score: parsed.score as 1 | 2 | 3 | 4,
      category: parsed.category,
      studyPopulationSummary: parsed.studyPopulationSummary,
      rationale: parsed.rationale,
      matches: parsed.matches,
      mismatches: parsed.mismatches,
      resolvedArticle: resolved ? { title: resolved.title, journal: resolved.journal, url: resolved.url } : null,
    };
  } catch (err) {
    console.error("Generalizability Checker failed:", err);
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }
}
