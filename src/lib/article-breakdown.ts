import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ArticleBreakdown } from "@/lib/article-breakdown-shared";

// Re-exported so server-side callers have one import site for the whole feature; the
// definitions live in the shared module because client components need them too.
export { BREAKDOWN_FIELDS, breakdownSourceText, BREAKDOWN_FAILED_MESSAGE, type ArticleBreakdown } from "@/lib/article-breakdown-shared";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * The short study breakdown shown on the article detail page in place of the publisher's
 * abstract (see components/ArticleBreakdown.tsx, app/actions/article-breakdown.ts).
 *
 * This *replaces* the abstract rather than summarizing alongside it. Two reasons, and the
 * second is the one that decided the shape:
 *
 *  1. A wall of abstract prose is the wrong unit for skimming a feed. Five labelled fields
 *     a clinician can read in ten seconds is the actual job.
 *  2. An abstract is the publisher's copyrighted text, and reproducing it in full is
 *     exactly the kind of thing the copyright pass has been walking back elsewhere in the
 *     app (see app/dmca/page.tsx). A breakdown written in Limbic's own words, next to a
 *     link out to the source, reproduces nothing.
 *
 * Point 2 is why the system prompt below is emphatic about not copying phrasing through:
 * a "summary" that quietly lifts the abstract's sentences would defeat the whole change.
 *
 * Same Anthropic client/structured-output pattern as the app's other single-turn tools
 * (lib/generalizability-score.ts, lib/generalizability.ts, lib/article-variables.ts,
 * lib/agent.ts) — one call, a zod-parsed response, no chat loop. Generated at most once per
 * article and cached forever (ArticleBreakdownCache), so this runs once across all readers.
 */

const SYSTEM_PROMPT = [
  "You write short, scannable breakdowns of research studies for physical therapy clinicians. You are given a study's title and abstract, and you return five fields that let a clinician understand the study in about ten seconds.",
  "",
  "Write everything in your own words. Do not copy phrases or sentences from the abstract — this breakdown replaces the abstract rather than reprinting it, so wording carried over verbatim defeats its purpose. Reuse only unavoidable technical terms: the names of conditions, interventions, and outcome measures.",
  "",
  "The five fields:",
  "1. question — one sentence on what the study set out to find out.",
  "2. population — who was actually studied, as a short phrase. Lead with the sample size if the abstract states one (e.g. \"62 adults with chronic low back pain, outpatient clinic\"). If it doesn't state one, say so rather than estimating.",
  "3. design — the study design and what was done or compared, as a short phrase (e.g. \"Randomized controlled trial, 12 weeks of supervised exercise vs. home program\"). Include the follow-up period when stated.",
  "4. findings — two to four short bullets, the results that matter. Include the actual numbers the abstract reports (effect sizes, percentages, between-group differences, p-values) — a finding stated without its number is close to useless for appraisal. One result per bullet.",
  "5. takeaway — one sentence on what this study suggests for physical therapy practice.",
  "",
  "Be accurate before being brief. Never invent a sample size, a setting, a follow-up period, or a number that the abstract does not state — if something isn't there, say it isn't reported. Do not overstate a finding: if the study found no significant difference, the findings and the takeaway must both say so plainly.",
  "",
  "Hard rules: never state or imply a diagnosis, never recommend a medication, dosage, or treatment decision. The takeaway describes what the evidence suggests, it does not tell a clinician what to do with a patient — this is evidence appraisal, not clinical decision-making. Never fabricate a citation or a detail not present in what you were given.",
  "",
  "Respond only in the requested structured format. No preamble, no markdown.",
].join("\n");

/* Array lengths live in .describe() text rather than as zod .min()/.max() constraints, for
   the same reason lib/generalizability-score.ts spells its counts out in prose: the SDK's
   zodOutputFormat demotes most numeric/length constraints to schema description text
   (see lib/transform-json-schema.js), so declaring them here buys no server-side
   enforcement while making zod's safeParse *throw* on an off-spec response. A breakdown
   that comes back with five findings instead of four should render, not become an error
   state. */
const BreakdownResponseSchema = z.object({
  question: z.string().describe("One sentence on what the study set out to find out."),
  population: z.string().describe("Who was studied, as a short phrase, leading with the sample size when stated."),
  design: z.string().describe("The study design and what was done or compared, as a short phrase."),
  findings: z.array(z.string()).min(1).describe("Two to four short bullets, one result each, with the numbers the abstract reports."),
  takeaway: z.string().describe("One sentence on what this study suggests for physical therapy practice."),
});

/** Builds the breakdown for one article from what the app already knows about it — its
 *  title and abstract text. Nothing is fetched: the caller is breaking down the article the
 *  reader is looking at. Returns null on any failure, including a response that parses but
 *  comes back effectively empty; the caller turns that into the link-out fallback. */
export async function generateArticleBreakdown(input: { title: string; abstract: string }): Promise<ArticleBreakdown | null> {
  const studyContext = [`Title: ${input.title}`, "", `Abstract: ${input.abstract}`].join("\n").trim();

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      // "low" effort matches the app's other structured-output tools — see lib/agent.ts on
      // why higher effort levels interact badly with strict structured-output parsing.
      output_config: { effort: "low", format: zodOutputFormat(BreakdownResponseSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Break down this study for a physical therapy clinician:\n\n${studyContext}`,
        },
      ],
    });

    const parsed = message.parsed_output;
    if (!parsed) return null;

    const findings = parsed.findings.map((f) => f.trim()).filter((f) => f.length > 0);
    // A breakdown with no findings left is worse than no breakdown: the reader would get
    // section headings over empty space where the abstract used to be. Fail instead, and
    // let the caller fall back to the link out to the source.
    if (findings.length === 0) return null;

    return {
      question: parsed.question.trim(),
      population: parsed.population.trim(),
      design: parsed.design.trim(),
      findings,
      takeaway: parsed.takeaway.trim(),
    };
  } catch (err) {
    console.error("Article breakdown failed:", err);
    return null;
  }
}
