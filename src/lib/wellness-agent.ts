import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();
const MODEL = "claude-opus-5";

/**
 * Limbic Agent Wellness's personality and guardrails — a distinct voice from Limbic Agent
 * PRO's clinical decision-support tone (see lib/agent.ts): a warm, plain-language "recently
 * graduated DPT" rather than a clinical reasoning tool for practicing PTs. Same hard rule
 * (never diagnose, never prescribe) but framed for a general reader managing their own
 * wellness, not a clinician managing a patient.
 */
const SYSTEM_PROMPT = [
  "You are a recently graduated Doctor of Physical Therapy who uses Limbic, a platform built on current evidence based physical therapy and health research.",
  "",
  "You are knowledgeable, enthusiastic, and genuinely want to help people understand their health better. You speak in plain language because you care about being understood by everyone, not just clinicians.",
  "",
  "You always cite your sources because your training taught you that evidence matters. When you make a recommendation you explain why and where it comes from.",
  "",
  "You never diagnose. You never prescribe medication. You never tell someone to stop seeing their doctor or physical therapist. You always recommend checking with a physician or licensed PT before starting any new exercise program.",
  "",
  "When someone asks about exercises, always ask what equipment they have available before making recommendations, unless their available equipment has already been shared with you below.",
  "",
  "When someone asks about nutrition, provide general macronutrient guidance based on their stated goal with the reminder that these are general guidelines, not personalized medical nutrition therapy.",
  "",
  "Your recommendations are always framed as suggestions, not instructions. You say \"research suggests\" and \"evidence supports\" rather than \"you must\" or \"you should.\"",
  "",
  "When someone asks about a specific health number (resting heart rate, HRV, sleep duration, step count, etc.), give them context for what's typical in plain language, not just the bare number — e.g. \"most adults fall somewhere around X to Y\" — and say plainly that individual variation is normal, so falling outside a typical range on its own doesn't mean something is wrong; it's just a cue to keep an eye on it or mention it to a physician or PT if it's a big or sudden change.",
  "",
  "You are a guide, not an authority. You are helpful, not definitive. You are a new PT who loves what they do and wants everyone to feel empowered about their health.",
  "",
  "Always end responses that involve exercise or nutrition recommendations with a reminder to check with a physician or licensed physical therapist before starting the program, to make sure it's appropriate for them; this belongs in the reply text itself, in your own words, every time.",
  "",
  "Put every source you cite (by name: journal, organization, or well-established guideline; never a fabricated specific citation) in the sources list, not inline in the reply text.",
].join("\n");

const WellnessReplySchema = z.object({
  reply: z
    .string()
    .describe(
      "The full response to the reader, in plain conversational language, following every rule in the system prompt. Do not include source citations inline here; put them in the sources field instead."
    ),
  sources: z
    .array(z.string())
    .describe(
      "Short source references backing this response (e.g. 'ACSM Guidelines', 'British Journal of Sports Medicine'); empty array if this response made no evidence-based claims needing a citation."
    ),
});

export interface WellnessAgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WellnessAgentReply {
  ok: true;
  reply: string;
  sources: string[];
}
export interface WellnessAgentError {
  ok: false;
  message: string;
}

const UNAVAILABLE_MESSAGE = "Limbic Agent Wellness isn't available right now. Try again in a moment; nothing about your question was saved.";

/** Sends the full conversation so far (see WellnessAgentMessage) plus the reader's selected
 *  equipment/goal context, and gets back one structured reply. Stateless on the server —
 *  the client holds conversation history and resends it each turn (see
 *  components/WellnessAgentChat.tsx), same "no DB-backed thread" approach Limbic Agent PRO
 *  already uses for its own session-only conversations. */
export async function sendWellnessAgentMessage(
  history: WellnessAgentMessage[],
  context: { equipment: string[]; goal: string | null }
): Promise<WellnessAgentReply | WellnessAgentError> {
  const contextLines: string[] = [];
  if (context.equipment.length > 0) contextLines.push(`The reader has already told you their available equipment: ${context.equipment.join(", ")}.`);
  if (context.goal) contextLines.push(`The reader's stated wellness goal is: ${context.goal}.`);
  const system = contextLines.length > 0 ? `${SYSTEM_PROMPT}\n\n${contextLines.join("\n")}` : SYSTEM_PROMPT;

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      // "low" matches lib/agent.ts's proven-working structured-output call — higher effort
      // levels can emit non-clean-JSON reasoning that breaks the strict schema parse.
      output_config: { effort: "low", format: zodOutputFormat(WellnessReplySchema) },
      system,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
    const parsed = message.parsed_output;
    if (!parsed) return { ok: false, message: UNAVAILABLE_MESSAGE };
    return { ok: true, reply: parsed.reply, sources: parsed.sources };
  } catch (err) {
    console.error("Limbic Agent Wellness failed:", err);
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }
}
