import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
// Same MODEL constant convention as lib/syllabus-parser.ts, lib/pre-visit-brief.ts, and
// lib/force-lab-import.ts — claude-opus-5 is this app's one standing choice for every
// AI-powered feature.
const MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `You are a PT student's study assistant. You are given the text of one lecture's slides (pasted by the student, not a file) for one course. Turn it into study material.

Return a single JSON object with exactly these fields:
- flashcards: array of objects, each with exactly {"front": string, "back": string} — the key terms, concepts, and definitions worth memorizing from this lecture. front is a short term or question, back is its definition or answer. Produce as many as the material actually supports, typically 5-20 — do not pad with trivial or repeated cards, and do not invent content not in the slides.
- notesSummary: string — a short study summary of the lecture in plain text, a few sentences to a few short paragraphs. If the material is naturally organized as a list of terms and their definitions or comparisons, ALSO include a markdown-style table using this exact pipe syntax on its own lines within notesSummary:
| Term | Definition |
| --- | --- |
| Example | Example definition |
Only include a table when the content genuinely fits that shape (e.g. terminology, muscle origins/insertions, special test names) — not for narrative material.

Return only the JSON object. No explanation. No other text.`;

/** Strips a ```json ... ``` (or bare ```) code fence — same defensive parse as
 *  lib/syllabus-parser.ts's own stripCodeFence, duplicated here per that file's own
 *  "each AI-parsing lib owns its parse helpers" convention. */
function stripCodeFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : text;
}

/** message.content[0] isn't reliably the response text — same fix as
 *  lib/syllabus-parser.ts's own firstTextBlock. */
function firstTextBlock(content: { type: string; text?: string }[]): string | null {
  const block = content.find((c) => c.type === "text");
  return typeof block?.text === "string" ? block.text : null;
}

export interface ParsedSlideFlashcard {
  front: string;
  back: string;
}

export interface ParsedSlideBreakdown {
  flashcards: ParsedSlideFlashcard[];
  notesSummary: string;
}

function isParsedFlashcard(value: unknown): value is ParsedSlideFlashcard {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.front === "string" && v.front.trim().length > 0 && typeof v.back === "string" && v.back.trim().length > 0;
}

/** Extracts flashcards and a study summary from pasted lecture slide text (see
 *  generateSlideBreakdown in app/actions/slide-breakdown.ts, the only caller) — returns null
 *  on any failure (rate limit, a non-JSON/non-object response) rather than throwing, same
 *  "don't crash the page, show a plain retry state" reasoning as parseSyllabusText. */
export async function parseSlideText(rawText: string, courseCode: string, courseName: string): Promise<ParsedSlideBreakdown | null> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Course Code: ${courseCode}
Course Name: ${courseName}

Slide text:
${rawText}

Extract flashcards and a study summary, and return as a single JSON object.`,
        },
      ],
    });

    const text = firstTextBlock(message.content);
    if (text === null) return null;

    const parsed: unknown = JSON.parse(stripCodeFence(text));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const v = parsed as Record<string, unknown>;

    const flashcards = Array.isArray(v.flashcards) ? v.flashcards.filter(isParsedFlashcard) : [];
    const notesSummary = typeof v.notesSummary === "string" ? v.notesSummary.trim() : "";
    if (flashcards.length === 0 && !notesSummary) return null;

    return { flashcards, notesSummary };
  } catch (error) {
    console.error("Slide breakdown parse failed:", error);
    return null;
  }
}
