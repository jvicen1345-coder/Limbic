import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();
// Same model as lib/agent.ts and the other structured-output helpers in this folder.
const MODEL = "claude-opus-5";

/**
 * Claude's check of one free-recall answer from the Focus timer (see
 * app/actions/focus.ts, submitRecalls and reviewRecall). After a focus block the student
 * names a topic and writes what they remember without looking at notes; this compares that
 * against accepted DPT-level knowledge, and against the student's own course flashcards when
 * the topic belongs to a course, and says what was right, what was missing, and what was
 * wrong. The score drives the review schedule in lib/focus-review.ts; keyPoints becomes the
 * back of the Self-Quiz card created from the topic.
 */
const RecallFeedbackSchema = z.object({
  // Range stated in the description rather than as min/max, matching
  // lib/generalizability-score.ts; checkRecall clamps and rounds it anyway.
  score: z.number().describe("0 to 100: how complete and accurate the recall is."),
  verdict: z.string(),
  correct: z.array(z.string()),
  missed: z.array(z.string()),
  incorrect: z.array(z.string()),
  keyPoints: z.array(z.string()),
});

export type RecallFeedback = z.infer<typeof RecallFeedbackSchema>;

const SYSTEM_PROMPT = [
  "You check free-recall answers for Doctor of Physical Therapy students in the Limbic app.",
  "",
  "After a study block, a student names a topic and writes what they remember about it from memory, without notes. Compare their recall to what a DPT student at their level is expected to know about that topic. When course flashcards are provided, treat them as the student's own course material and weight them heavily, but still flag anything in the recall that is factually wrong even if the cards don't cover it.",
  "",
  "Return:",
  "- score: 0-100, how complete and accurate the recall is for the core of this topic. Short but accurate recall of the essentials can still score well; confident errors lower the score more than omissions. 80+ means they have the core solidly; below 50 means major gaps or errors.",
  "- verdict: one plain sentence to the student summarizing how they did. No praise padding.",
  "- correct: up to 4 specific things they got right, each under 15 words.",
  "- missed: up to 4 of the most important things they left out, each under 20 words, stated as the fact itself (for example 'Long thoracic nerve comes off C5-C7 roots, not a cord').",
  "- incorrect: anything they stated that is wrong, each written as the correction, under 25 words. Empty if nothing was wrong.",
  "- keyPoints: 3 to 5 concise key facts that define this topic, the way a good flashcard back would read.",
  "",
  "If the topic is too vague to check (for example 'stuff from lecture'), score what you can, and say in the verdict that naming a narrower topic would get more useful feedback. If the recall is not about physical therapy or health science at all, still check it on its own terms.",
  "",
  "Write to the student directly. Use standard clinical terminology. Respond only in the requested structured format.",
].join("\n");

export interface RecallCheckInput {
  topic: string;
  note: string;
  subjectLabel: string;
  /** Up to ~40 of the course's own StudyCard rows, when the recall is tied to a course. */
  courseCards: { front: string; back: string }[];
}

/**
 * Returns null on any failure (rate limit, network, an unexpected response shape) instead of
 * throwing, so a failed check never loses the student's written recall: the caller still
 * saves the note and schedules the review, just without feedback.
 */
export async function checkRecall(input: RecallCheckInput): Promise<RecallFeedback | null> {
  const cards = input.courseCards
    .slice(0, 40)
    .map((c) => `- ${c.front.slice(0, 200)} :: ${c.back.slice(0, 400)}`)
    .join("\n");

  try {
    const message = await client.messages.parse({
      model: MODEL,
      max_tokens: 1200,
      output_config: { effort: "low", format: zodOutputFormat(RecallFeedbackSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            `Subject: ${input.subjectLabel}`,
            `Topic: ${input.topic}`,
            cards ? `Course flashcards for this subject:\n${cards}` : "No course flashcards available for this subject.",
            "",
            `Student's recall, written from memory:\n"""\n${input.note}\n"""`,
          ].join("\n"),
        },
      ],
    });
    const parsed = message.parsed_output;
    if (!parsed) return null;
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      verdict: parsed.verdict.trim(),
      correct: parsed.correct.slice(0, 4),
      missed: parsed.missed.slice(0, 4),
      incorrect: parsed.incorrect.slice(0, 4),
      keyPoints: parsed.keyPoints.slice(0, 5),
    };
  } catch (err) {
    console.error("Focus timer recall check failed:", err);
    return null;
  }
}
