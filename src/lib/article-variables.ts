import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { resolvePubmedAbstract } from "@/lib/pubmed";
import type { ArticleVariable } from "@/lib/histogram";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * The Article Histogram Explorer's extraction step (see components/pro/ArticleHistogramExplorer.tsx,
 * lib/histogram.ts for the deterministic bin-building this feeds, app/(app)/pro/research-literacy/page.tsx) —
 * built on the same resolvePubmedAbstract (lib/pubmed.ts) + Anthropic structured-output pattern as
 * lib/generalizability.ts, but a real PubMed record is required here, not a free-text fallback: this tool
 * is specifically "pick a variable from the given research article," and a plotted histogram implies real
 * reported numbers behind it, unlike the Generalizability Checker's population comparison which works fine
 * from a reader's own description.
 *
 * The model's only job is extraction — read the actual abstract text and report which variables have real
 * numbers attached (mean/SD, or median/range), never invent one. All histogram math happens afterward,
 * deterministically, in lib/histogram.ts — asking the model to directly produce bin counts would be asking
 * it to fabricate data with no grounding, exactly what the research-literacy guide's own "never trust a
 * summary statistic" content warns readers about.
 */
const SYSTEM_PROMPT = [
  "You are Limbic Agent's Article Variable Extractor, part of the Research & Statistics Literacy toolbox in the Limbic app for physical therapy clinicians and students.",
  "",
  "Your one job: read a research article's abstract and identify which reported variables have enough quantitative detail to reconstruct an approximate distribution — at minimum a mean and standard deviation, OR a median with a min/max or IQR. Do not include a variable unless the abstract states real numbers for it. Never invent, estimate, or infer a mean, SD, or range that isn't actually written in the text.",
  "",
  "For each qualifying variable, extract: its name as reported (e.g. 'Age', 'BMI', 'Mini-BESTest total score'), its unit if any (null if unitless, like a test score), sample size (n) if given, mean, SD, median, min, and max exactly as reported (null for any not given), and a best-guess shape: 'normal', 'right-skewed', 'left-skewed', or 'unknown'. Base the shape only on explicit language in the abstract (e.g. 'skewed', 'non-normally distributed', reporting median instead of mean) or well-established measurement properties (e.g. completion times and pain/symptom scores are commonly right-skewed, floored near zero) — default to 'unknown' rather than guessing without basis.",
  "",
  "If the abstract reports no variables with enough quantitative detail to build even an approximate distribution, return an empty list. Do not force a result.",
  "",
  "Respond only in the requested structured format. No chat preamble, no markdown formatting.",
].join("\n");

const ArticleVariableSchema = z.object({
  name: z.string().describe("The variable's name as reported in the abstract, e.g. 'Age', 'BMI', 'Mini-BESTest total score'."),
  unit: z.string().nullable().describe("Unit of measure if any (e.g. 'years', 'kg/m²'); null for an unitless score."),
  n: z.number().int().positive().nullable().describe("Sample size this variable was reported over, if stated."),
  mean: z.number().nullable(),
  sd: z.number().nullable().describe("Standard deviation, if reported."),
  median: z.number().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  shape: z.enum(["normal", "right-skewed", "left-skewed", "unknown"]),
});

const ArticleVariablesResponseSchema = z.object({
  variables: z.array(ArticleVariableSchema).max(6),
});

export interface ResolvedHistogramArticle {
  title: string;
  journal: string;
  url: string;
}

export interface ArticleVariablesResult {
  ok: true;
  resolvedArticle: ResolvedHistogramArticle;
  variables: ArticleVariable[];
}
export interface ArticleVariablesError {
  ok: false;
  message: string;
}

const UNAVAILABLE_MESSAGE =
  "The Article Histogram Explorer isn't available right now. Try again in a moment; nothing you entered was saved.";

export async function extractArticleVariables(studyInput: string): Promise<ArticleVariablesResult | ArticleVariablesError> {
  const resolved = await resolvePubmedAbstract(studyInput);
  if (!resolved) {
    return { ok: false, message: "Couldn't find that article on PubMed — paste a PubMed link, PMID, DOI, or the article's title/citation." };
  }
  if (!resolved.abstract) {
    return { ok: false, message: `Found "${resolved.title}" but no abstract is on file for it, so there's nothing to pull variables from.` };
  }

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      // "low" matches lib/generalizability.ts's proven-working call.
      output_config: { effort: "low", format: zodOutputFormat(ArticleVariablesResponseSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Abstract (title: "${resolved.title}", journal: ${resolved.journal}):\n${resolved.abstract}\n\nExtract every variable reported with enough quantitative detail to plot.`,
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: UNAVAILABLE_MESSAGE };

    return {
      ok: true,
      resolvedArticle: { title: resolved.title, journal: resolved.journal, url: resolved.url },
      variables: parsed.variables,
    };
  } catch (err) {
    console.error("Article Histogram Explorer extraction failed:", err);
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }
}
