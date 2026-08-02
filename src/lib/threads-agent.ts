import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Article } from "@/lib/types";
import { THREADS_INSIGHT_META, type ThreadsInsightKind } from "@/lib/threads-graph";
import { SPECIALTY_META } from "@/lib/meta";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/** Same clinical guardrails as Limbic Agent's own system prompt (see lib/agent.ts) —
 *  Threads' insight nodes are Limbic Agent's reasoning applied to one specific article,
 *  not a separate, less-governed content path. */
function systemPrompt(licensed: boolean): string {
  return [
    "You are Limbic Agent, a clinical decision support tool for physical therapy, built into the Limbic app.",
    "You are answering one specific, narrow question about one specific article — not a general clinical case.",
    "",
    "Hard rules, no exceptions:",
    "- You never state or imply a diagnosis for a specific patient. Frame everything as considerations or what the general evidence says.",
    "- You never recommend a specific medication, dosage, or route of administration.",
    "- You never fabricate a specific citation (author names, journal, year, DOI) beyond what's given to you about this article. You may reference the KIND of evidence something rests on without inventing a specific source.",
    "- If something is not well-established, say so plainly rather than presenting it with false confidence.",
    "",
    "Voice: confident but humble, teaching the reasoning rather than just stating a fact. 2-4 sentences, no more.",
    "",
    licensed
      ? "Audience: a licensed, practicing physical therapist."
      : "Audience: a PT student or someone without a PT license yet — briefly ground foundational concepts, but stay concise.",
    "",
    "Respond only in the requested structured format. No chat preamble, no markdown formatting, no disclaimer text — the app displays the legal disclaimer separately.",
  ].join("\n");
}

const InsightSchema = z.object({
  detail: z.string().describe("2-4 sentences answering exactly what was asked, following every hard rule in the system prompt."),
});

export interface ThreadsInsightResult {
  ok: true;
  detail: string;
}
export interface ThreadsInsightError {
  ok: false;
  message: string;
}

const UNAVAILABLE_MESSAGE = "Limbic Agent isn't available right now. Try again in a moment.";

/** Generates one Threads insight node's detail text, scoped tightly to a single article
 *  and a single question (see THREADS_INSIGHT_META for what each kind asks) — never the
 *  full open-ended reasoning web Limbic Agent's own chat produces (see lib/agent.ts). */
export async function generateThreadsInsight(
  article: Pick<Article, "title" | "summary" | "specialty" | "tags">,
  insightKind: ThreadsInsightKind,
  licensed: boolean
): Promise<ThreadsInsightResult | ThreadsInsightError> {
  const { ask } = THREADS_INSIGHT_META[insightKind];
  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low", format: zodOutputFormat(InsightSchema) },
      system: systemPrompt(licensed),
      messages: [
        {
          role: "user",
          content: [
            `Article title: ${article.title}`,
            `Article summary: ${article.summary}`,
            `Specialty: ${SPECIALTY_META[article.specialty]}`,
            article.tags.length ? `Tags: ${article.tags.join(", ")}` : null,
            "",
            `Question: ${ask}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: UNAVAILABLE_MESSAGE };
    return { ok: true, detail: parsed.detail };
  } catch (err) {
    console.error("Limbic Threads generateThreadsInsight failed:", err);
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }
}
