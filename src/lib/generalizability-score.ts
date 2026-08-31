import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * The automatic generalizability score shown in the article detail page's "Analyze This
 * Study" panel (see components/ArticleResearchPanel.tsx, app/actions/research-literacy.ts).
 *
 * Deliberately a *different* tool from the Generalizability Checker on
 * /pro/research-literacy (lib/generalizability.ts), not a rename of it — that one compares a
 * study against a target population the reader types in, and can't run until they've
 * described a patient. This one asks no questions: it scores how generalizable the study is
 * to typical PT practice across six fixed domains, from the article's own title and
 * abstract, so it can generate the instant the panel opens. The standalone page's checker is
 * untouched and still the tool to reach for when you have a specific patient in mind.
 *
 * Same Anthropic client/structured-output pattern as the rest of the app's single-turn tools
 * (lib/generalizability.ts, lib/article-variables.ts, lib/agent.ts) — one call, a zod-parsed
 * response, no chat loop. Scored once per article and cached forever (GeneralizabilityCache),
 * so this runs at most once per article across all readers.
 */

/** The six domains, in the order they're scored and rendered. Setting and Population are
 *  weighted 1.5x in the overall score (see WEIGHTS below) — they're the two that most often
 *  decide whether a result transfers to an outpatient PT caseload at all. */
const FACTOR_NAMES = [
  "Population",
  "Setting",
  "Sample Size",
  "Follow-up Duration",
  "Outcome Measures",
  "Intervention Replicability",
] as const;

const WEIGHTS: Record<(typeof FACTOR_NAMES)[number], number> = {
  Population: 1.5,
  Setting: 1.5,
  "Sample Size": 1,
  "Follow-up Duration": 1,
  "Outcome Measures": 1,
  "Intervention Replicability": 1,
};

const SYSTEM_PROMPT = [
  "You are a research methodology expert helping physical therapy clinicians quickly assess how generalizable a study's findings are to typical PT practice. You analyze research abstracts and score their generalizability across six domains.",
  "",
  "Score each domain from 0 to 10 where 10 is most generalizable. Be honest and critical — most studies have real limitations.",
  "",
  "The six domains, always in this order:",
  "1. Population — what the study's sample actually was, and how that affects generalizability to typical PT patients.",
  "2. Setting — where the study was run, and how that affects real-world applicability.",
  "3. Sample Size — the actual n if stated, or estimated from the abstract, and whether it's adequate for this study design.",
  "4. Follow-up Duration — the follow-up period stated or estimated, and whether long-term effects can be inferred.",
  "5. Outcome Measures — the primary outcome measures used, and how clinically relevant they are.",
  "6. Intervention Replicability — how well-described the intervention is, and whether a typical PT could replicate it.",
  "",
  "For each domain give one sentence of 'finding' (what the study did) and one sentence of 'impact' (what that means for generalizability). Reference the actual details in the abstract — never invent a number, a setting, or a follow-up period that isn't there. If the abstract doesn't state something, say so in the finding and score the domain lower for the uncertainty rather than guessing a value.",
  "",
  "The overall score is a weighted average of the six domain scores — weight Setting and Population at 1.5x, the other four at 1x. Calculate it accurately and report it to one decimal.",
  "",
  "The summary is two sentences: your overall interpretation of this study's generalizability for a PT clinician.",
  "",
  "Limitations are three to four specific generalizability limitations, each a short string — specific to this study, not generic research-appraisal boilerplate.",
  "",
  "Hard rules: never state or imply a diagnosis, never recommend a medication, dosage, or treatment decision — this is evidence appraisal, not clinical decision-making. Never fabricate a citation or a detail not present in what you were given.",
  "",
  "Respond only in the requested structured format. No preamble, no markdown.",
].join("\n");

/* Numeric ranges and exact array lengths are expressed in .describe() text rather than as
   zod .min()/.max()/.length() constraints on purpose. The SDK's zodOutputFormat can only
   pass a subset of JSON Schema to the API as an enforced constraint (see
   lib/transform-json-schema.js — minItems above 1, maxItems, and numeric minimum/maximum are
   all demoted to schema description text); zod's own safeParse, though, still enforces them
   strictly and *throws*. Declaring them here would therefore buy no server-side enforcement
   while turning "the model returned five factors instead of six" into a hard failure and an
   error state for the reader. The counts are instructed in the prompt, the scores are
   clamped below, and the overall score is recomputed from the factors — so an off-spec
   response degrades instead of breaking. */
const FactorSchema = z.object({
  name: z.enum(FACTOR_NAMES).describe("The domain name, exactly as listed."),
  score: z.number().describe("0 to 10, where 10 is most generalizable."),
  finding: z.string().describe("One sentence describing what the study actually did on this domain."),
  impact: z.string().describe("One sentence on how that affects generalizability to typical PT practice."),
});

const ScoreResponseSchema = z.object({
  overallScore: z.number().describe("Weighted average of the six domain scores, 0 to 10, one decimal. Population and Setting count 1.5x."),
  factors: z.array(FactorSchema).min(1).describe("All six domains, in the order listed in the system prompt."),
  summary: z.string().describe("Two sentences interpreting the overall generalizability for a PT clinician."),
  limitations: z.array(z.string()).min(1).describe("Three to four specific generalizability limitations, each a short string."),
});

export interface GeneralizabilityScoreFactor {
  name: string;
  score: number;
  finding: string;
  impact: string;
}

export interface GeneralizabilityScore {
  overallScore: number;
  label: string;
  /** A CSS color for the score number, label and bars — a literal so it can be applied
   *  inline to the dynamic fill widths. Comes from SCORE_BANDS below, never from the model. */
  color: string;
  factors: GeneralizabilityScoreFactor[];
  summary: string;
  limitations: string[];
  /** True when this came back from GeneralizabilityCache rather than a fresh Anthropic call
   *  — the panel shows a small "Cached" pill so the reader knows it was pre-computed. */
  cached: boolean;
}

/** Score bands, highest first. The colors are the app's own tokens where one fits
 *  (--color-success for the top band, --color-accent for the middle, --color-danger for the
 *  bottom) rather than literal hex, so the panel tracks the palette like everything else;
 *  the "limited" band uses --color-warn, which is exactly the amber this tier calls for. */
const SCORE_BANDS: { min: number; label: string; color: string }[] = [
  { min: 8, label: "Highly Generalizable", color: "var(--color-success)" },
  { min: 6, label: "Moderately Generalizable", color: "var(--color-accent)" },
  { min: 4, label: "Limited Generalizability", color: "var(--color-warn)" },
  { min: 0, label: "Low Generalizability", color: "var(--color-danger)" },
];

function bandFor(score: number): { label: string; color: string } {
  const band = SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
  return { label: band.label, color: band.color };
}

/** Recompute the weighted average ourselves rather than trusting the model's own arithmetic
 *  — the prompt asks for it so the model reasons about the weighting, but the number the
 *  reader sees (and that picks the band/color) is derived from the six domain scores it
 *  actually returned, so the headline can never disagree with the breakdown below it. */
function weightedOverall(factors: GeneralizabilityScoreFactor[]): number {
  let weighted = 0;
  let totalWeight = 0;
  for (const f of factors) {
    const weight = WEIGHTS[f.name as (typeof FACTOR_NAMES)[number]] ?? 1;
    weighted += f.score * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 0;
  return Math.round((weighted / totalWeight) * 10) / 10;
}

export const SCORING_FAILED_MESSAGE =
  "Could not score this study. The abstract may not contain enough information.";

/** Builds the score for one article from whatever the app already knows about it — its
 *  title and summary/abstract, plus the DOI/source link for provenance. Nothing is fetched:
 *  the panel is scoring the article the reader is looking at, and the article's own summary
 *  is the abstract. Returns null on any failure; the caller turns that into the panel's
 *  error state. */
export async function scoreStudyGeneralizability(input: {
  title: string;
  summary: string;
  doi: string | null;
  sourceUrl: string | null;
}): Promise<GeneralizabilityScore | null> {
  const studyContext = [
    `Title: ${input.title}`,
    "",
    `Abstract: ${input.summary}`,
    input.doi ? `\nDOI: ${input.doi}` : "",
    input.sourceUrl ? `\nSource: ${input.sourceUrl}` : "",
  ]
    .join("\n")
    .trim();

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      // "low" effort matches the app's other structured-output tools — see lib/agent.ts on
      // why higher effort levels interact badly with strict structured-output parsing.
      output_config: { effort: "low", format: zodOutputFormat(ScoreResponseSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Score the generalizability of this study for physical therapy clinical practice:\n\n${studyContext}`,
        },
      ],
    });

    const parsed = message.parsed_output;
    if (!parsed) return null;

    const factors: GeneralizabilityScoreFactor[] = parsed.factors.map((f) => ({
      name: f.name,
      score: Math.max(0, Math.min(10, f.score)),
      finding: f.finding,
      impact: f.impact,
    }));

    const overallScore = weightedOverall(factors);
    const { label, color } = bandFor(overallScore);

    return {
      overallScore,
      label,
      color,
      factors,
      summary: parsed.summary,
      limitations: parsed.limitations,
      cached: false,
    };
  } catch (err) {
    console.error("Generalizability scoring failed:", err);
    return null;
  }
}
