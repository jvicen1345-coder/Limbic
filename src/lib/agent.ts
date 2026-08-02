import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { AgentNode, AgentLink, AgentRing } from "@/lib/agent-graph";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * Limbic Agent's clinical personality and legal guardrails, in one place so every call
 * (the initial web and every ring expansion) is governed by the exact same rules —
 * confident but humble, evidence-based, teaches reasoning rather than handing over an
 * answer, adapts to the reader's experience level, and never crosses from clinical
 * decision support into diagnosis or medication guidance. The "defer to direct patient
 * assessment" requirement is additionally enforced as a persistent UI banner (see
 * AgentClient.tsx) rather than trusted to appear in every generated response — a legal
 * requirement shouldn't depend on the model remembering to say it every time.
 */
function systemPrompt(licensed: boolean): string {
  return [
    "You are Limbic Agent, a clinical decision support tool for physical therapy, built into the Limbic app.",
    "",
    "Hard rules, no exceptions:",
    "- You never state or imply a diagnosis for a specific patient. Frame everything as considerations, differentials to explore, or what the general evidence says — never a definitive answer about the person in front of the clinician.",
    "- You never recommend a specific medication, dosage, or route of administration. That is outside physical therapy scope of practice.",
    "- You never fabricate a specific citation (author names, journal, year, DOI). You may reference the KIND of evidence something rests on (e.g. \"supported by clinical practice guidelines\", \"well-established in the literature\", \"more limited evidence, largely from case series\") without inventing a specific source.",
    "- If something is not well-established, say so plainly rather than presenting it with false confidence.",
    "",
    "Voice: confident but humble — you know this material deeply, but you are a support tool assisting a clinician's own judgment, not the final word. Teach the reasoning, not just the fact: briefly explain WHY something matters, not just that it exists.",
    "",
    licensed
      ? "Audience: a licensed, practicing physical therapist. Write for someone with foundational PT knowledge already — focus on clinical reasoning, nuance, and what's actually useful in a real encounter."
      : "Audience: a PT student or someone without a PT license yet. Briefly ground foundational concepts a licensed PT would already know, since this may be a learning moment — but stay concise, don't lecture.",
    "",
    "Respond only in the requested structured format. No chat preamble, no markdown formatting, no disclaimer text in your own output — the app displays the legal disclaimer separately, on every screen, automatically.",
  ].join("\n");
}

const CenterResponseSchema = z.object({
  centerLabel: z
    .string()
    .describe("A concise 3-7 word label summarizing the case or question, for the center node of the web."),
  categories: z
    .array(
      z.object({
        label: z.string().describe("A short 2-5 word clinical reasoning category label."),
        teaser: z.string().describe("One sentence describing what this branch of the web will cover."),
      })
    )
    .min(3)
    .max(6)
    .describe(
      "The main clinical reasoning categories relevant to this specific question — drawn from things like " +
        "history/subjective findings, objective tests & measures, differential considerations, interventions, " +
        "and precautions/red flags, but tailored to what's actually relevant here. Don't force a category that " +
        "doesn't apply to this question."
    ),
});

const ExpansionResponseSchema = z.object({
  children: z
    .array(
      z.object({
        label: z.string().describe("A short 2-6 word node label — a specific finding, test, treatment, or piece of evidence."),
        detail: z
          .string()
          .describe(
            "2-4 sentences of clinical reasoning for this node — teach the why, grounded in established " +
              "PT/rehab knowledge, following every hard rule in the system prompt."
          ),
        relatedToLabel: z
          .string()
          .nullable()
          .describe(
            "If — and only if — this node has a genuinely meaningful clinical connection to one of the " +
              "'existing nodes already in the web' listed in the prompt, put that other node's EXACT label here " +
              "verbatim so the app can draw a line between them. Use this rarely; most nodes have no such " +
              "connection. Null when there isn't one — don't force it."
          ),
      })
    )
    .min(2)
    .max(6),
});

export interface AgentWebResult {
  ok: true;
  nodes: AgentNode[];
  /** Cross-branch relationship lines only — the parent/child "tree" links are derived
   *  client-side from each node's parentId, so this array never duplicates those. */
  crossLinks: AgentLink[];
}
export interface AgentWebError {
  ok: false;
  message: string;
}

const UNAVAILABLE_MESSAGE =
  "Limbic Agent isn't available right now. Try again in a moment — nothing about your question was saved.";

/** Starts a new web: a center node (the question) plus its first ring of clinical
 *  reasoning categories. See expandAgentNode() for growing rings 2 and 3. */
export async function startAgentWeb(
  question: string,
  licensed: boolean
): Promise<AgentWebResult | AgentWebError> {
  try {
    const message = await client.messages.parse({
      model: MODEL,
      // Generous headroom: "effort: medium" can spend a meaningful chunk of the budget on
      // internal reasoning before it ever emits the structured JSON, and a truncated
      // response fails to parse (see the catch below) — a low limit here reads as "Limbic
      // Agent isn't available" even though the model was actually mid-answer.
      max_tokens: 4096,
      output_config: { effort: "medium", format: zodOutputFormat(CenterResponseSchema) },
      system: systemPrompt(licensed),
      messages: [
        {
          role: "user",
          content: `Clinical question or case: ${question}\n\nGenerate the center label and first-ring categories for this web.`,
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: UNAVAILABLE_MESSAGE };

    const centerId = "center";
    const nodes: AgentNode[] = [
      { id: centerId, parentId: null, ring: 0, label: parsed.centerLabel, detail: question, expandable: false },
      ...parsed.categories.map((c, i) => ({
        id: `r1-${i}`,
        parentId: centerId,
        ring: 1 as AgentRing,
        label: c.label,
        detail: c.teaser,
        expandable: true,
      })),
    ];
    return { ok: true, nodes, crossLinks: [] };
  } catch (err) {
    console.error("Limbic Agent startAgentWeb failed:", err);
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }
}

/** Grows one more ring out from an existing node — ring 1 -> 2 (specific findings/tests/
 *  treatments) or ring 2 -> 3 (evidence, research framing, red flags). Ring 3 is always
 *  terminal (see AgentRing), so this is never called on a ring-3 node.
 *
 *  existingNodes is the web's current node set (id + label only) — passed to the model so
 *  it can point back at a specific one by exact label for a cross-branch connection. A
 *  label the model gets wrong or half-remembers just fails to match anything below and is
 *  silently dropped, rather than drawing a bogus line to a made-up node. */
export async function expandAgentNode(
  originalQuestion: string,
  parentId: string,
  nodeLabel: string,
  parentRing: AgentRing,
  ancestorLabels: string[],
  existingNodes: { id: string; label: string }[],
  licensed: boolean
): Promise<AgentWebResult | AgentWebError> {
  const childRing = (parentRing + 1) as AgentRing;
  const framing =
    childRing === 2
      ? "specific findings, named special tests, or specific interventions that fall under this category"
      : "the evidence, research framing, or precautions/red flags relevant to this specific item";

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: "medium", format: zodOutputFormat(ExpansionResponseSchema) },
      system: systemPrompt(licensed),
      messages: [
        {
          role: "user",
          content: [
            `Original clinical question or case: ${originalQuestion}`,
            ancestorLabels.length ? `Path so far: ${ancestorLabels.join(" -> ")}` : null,
            `Expand this node: "${nodeLabel}"`,
            `Generate ${framing}.`,
            existingNodes.length
              ? `Existing nodes already in the web (for the optional relatedToLabel field only — do not repeat these as new children): ${existingNodes.map((n) => n.label).join(", ")}`
              : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: UNAVAILABLE_MESSAGE };

    const labelToId = new Map(existingNodes.map((n) => [n.label.trim().toLowerCase(), n.id]));
    const nodes: AgentNode[] = [];
    const crossLinks: AgentLink[] = [];

    parsed.children.forEach((c, i) => {
      const id = `${parentId}-c${i}`;
      nodes.push({
        id,
        parentId,
        ring: childRing,
        label: c.label,
        detail: c.detail,
        expandable: childRing < 3,
      });
      const relatedId = c.relatedToLabel ? labelToId.get(c.relatedToLabel.trim().toLowerCase()) : undefined;
      if (relatedId) crossLinks.push({ source: id, target: relatedId, kind: "cross" });
    });

    return { ok: true, nodes, crossLinks };
  } catch (err) {
    console.error("Limbic Agent expandAgentNode failed:", err);
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }
}
