import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { MEETING_DAY_CODES } from "@/lib/calendar-events";

const client = new Anthropic();
// Same MODEL constant convention as lib/pre-visit-brief.ts and lib/force-lab-import.ts —
// claude-opus-5 is this app's one standing choice for every AI-powered feature.
const MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `You are an academic assistant that extracts information from course syllabi.

Extract two things from the syllabus text provided:

1. The recurring weekly class meeting pattern, if one is clearly stated (e.g. "Lecture meets MWF 9:00-9:50 AM", "Tuesdays and Thursdays 1:00-2:15 PM in room 204"). Only extract this if a specific weekly pattern is actually stated — do not guess from an assignment due date or a one-time event.
2. Every graded item, assignment, exam, quiz, practical, paper, and lab.

Return a single JSON object with exactly these fields:
- meetingDays: array of strings, each one of ${JSON.stringify(MEETING_DAY_CODES)} — every day the class meets each week, or null if no clear recurring pattern is stated
- meetingTimes: an object whose keys are entries from meetingDays and whose values are that day's meeting time range as written (e.g. {"Mon": "10:00 AM-10:50 AM", "Fri": "8:30 AM-9:20 AM"}) — the same class can meet at a different time on different days, so give each day in meetingDays its own time if the text supports it. If every day shares one stated time, use that same value for every key. Omit a day's key if no time is stated for it specifically. Null if meetingDays is null or no time is stated for any day.
- assignments: array of objects, each with exactly these fields:
  - title: string — the assignment or exam name
  - dueDate: string — the due date in YYYY-MM-DD format — if no year is specified assume the current academic year
  - category: string — one of: "Exam", "Quiz", "Assignment", "Lab Practical", "Paper", "Presentation", "Clinical", "Other"
  - courseCode: string — the course code provided
  - courseName: string — the course name provided

If an assignment's due date cannot be determined with reasonable confidence — omit that item entirely rather than guessing.
Return only the JSON object. No explanation. No other text.`;

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

export interface ParsedSyllabus {
  /** Short day codes from MEETING_DAY_CODES (lib/calendar-events.ts), or null if the
   *  syllabus text didn't state a clear recurring weekly meeting pattern. */
  meetingDays: string[] | null;
  /** Maps a meetingDays entry to its own free-text time as written in the syllabus (e.g.
   *  "9:00 AM-9:50 AM") — display only, and a day can be missing a key here even when
   *  meetingDays isn't null (no time stated for that specific day). Null whenever
   *  meetingDays is null. */
  meetingTimes: Record<string, string> | null;
  assignments: ParsedAssignment[];
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

function parseMeetingDays(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const days = value.filter((d): d is string => typeof d === "string" && (MEETING_DAY_CODES as readonly string[]).includes(d));
  return days.length > 0 ? days : null;
}

/** Keeps only entries whose key is an actual meeting day and whose value is a string —
 *  meetingDays is the source of truth for which days the class meets, so a stray key here
 *  that isn't in it is dropped rather than trusted. */
function parseMeetingTimes(value: unknown, meetingDays: string[]): Record<string, string> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [string, string] => meetingDays.includes(entry[0]) && typeof entry[1] === "string"
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/** Extracts the recurring meeting pattern and assignments/exams from a pasted syllabus text
 *  block (see parseSyllabusFromText in app/actions/syllabus.ts, the only caller) — returns
 *  null on any failure (rate limit, a non-JSON/non-object response) rather than throwing,
 *  same "don't crash the page, show a plain retry state" reasoning as every other AI call in
 *  this app. Filters out any assignment entry that doesn't match ParsedAssignment's shape
 *  instead of failing the whole batch over one malformed item; meetingDays is independently
 *  re-validated against the same whitelist the server action enforces, since this is still
 *  AI output. */
export async function parseSyllabusText(rawText: string, courseCode: string, courseName: string): Promise<ParsedSyllabus | null> {
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

Extract the meeting pattern and all assignments, and return as a single JSON object.`,
        },
      ],
    });

    const text = firstTextBlock(message.content);
    if (text === null) return null;

    const parsed: unknown = JSON.parse(stripCodeFence(text));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const v = parsed as Record<string, unknown>;

    const meetingDays = parseMeetingDays(v.meetingDays);
    return {
      meetingDays,
      meetingTimes: meetingDays ? parseMeetingTimes(v.meetingTimes, meetingDays) : null,
      assignments: Array.isArray(v.assignments) ? v.assignments.filter(isParsedAssignment) : [],
    };
  } catch (error) {
    console.error("Syllabus parse failed:", error);
    return null;
  }
}
