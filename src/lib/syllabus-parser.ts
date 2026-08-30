import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
// Same MODEL constant convention as lib/pre-visit-brief.ts and lib/force-lab-import.ts —
// claude-opus-5 is this app's one standing choice for every AI-powered feature.
const MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `You are an academic assistant that extracts assignment and exam information from course syllabi. Extract every graded item, assignment, exam, quiz, practical, paper, and lab from the syllabus text provided.

Return a JSON array of objects with exactly these fields:
- title: string — the assignment or exam name
- dueDate: string — the due date in YYYY-MM-DD format — if no year is specified assume the current academic year
- category: string — one of: "Exam", "Quiz", "Assignment", "Lab Practical", "Paper", "Presentation", "Clinical", "Other"
- courseCode: string — the course code provided
- courseName: string — the course name provided

If a date cannot be determined with reasonable confidence — omit that item entirely rather than guessing.
Return only the JSON array. No explanation. No other text.`;

/** Strips a ```json ... ``` (or bare ```) code fence — same defensive parse as
 *  lib/force-lab-import.ts's own stripCodeFence, duplicated here rather than shared per
 *  that file's own "each AI-parsing lib owns its parse helpers" convention. */
function stripCodeFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : text;
}

/** message.content[0] isn't reliably the response text — even at low effort, claude-opus-5
 *  can still emit a "thinking" block ahead of its actual text block (same fix as
 *  lib/force-lab-import.ts's own firstTextBlock). */
function firstTextBlock(content: { type: string; text?: string }[]): string | null {
  const block = content.find((c) => c.type === "text");
  return typeof block?.text === "string" ? block.text : null;
}

export interface ParsedAssignment {
  title: string;
  dueDate: string;
  category: string;
  courseCode: string;
  courseName: string;
}

function isParsedAssignment(value: unknown): value is ParsedAssignment {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.dueDate === "string" &&
    typeof v.category === "string" &&
    typeof v.courseCode === "string" &&
    typeof v.courseName === "string"
  );
}

/** Extracts assignments/exams from a pasted syllabus text block (see parseSyllabusFromText
 *  in app/actions/syllabus.ts, the only caller) — returns null on any failure (rate limit, a
 *  non-JSON/non-array response, an item missing a required field) rather than throwing, same
 *  "don't crash the page, show a plain retry state" reasoning as every other AI call in this
 *  app. Filters out any array entry that doesn't match ParsedAssignment's shape instead of
 *  failing the whole batch over one malformed item. */
export async function parseSyllabusText(
  rawText: string,
  courseCode: string,
  courseName: string
): Promise<ParsedAssignment[] | null> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Course Code: ${courseCode}
Course Name: ${courseName}

Syllabus text:
${rawText}

Extract all assignments and return as JSON array.`,
        },
      ],
    });

    const text = firstTextBlock(message.content);
    if (text === null) return null;

    const parsed: unknown = JSON.parse(stripCodeFence(text));
    if (!Array.isArray(parsed)) return null;

    return parsed.filter(isParsedAssignment);
  } catch (error) {
    console.error("Syllabus parse failed:", error);
    return null;
  }
}
