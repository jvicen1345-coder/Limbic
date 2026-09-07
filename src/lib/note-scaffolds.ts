/** Section headings for each clinical note type — the empty skeleton a clinician fills in,
 *  not prose (see components/pro/dashboard/ClinicalNotesSection.tsx).
 *
 *  Deliberately headings only. The full worked templates, with a bracketed prompt under every
 *  heading, already exist at /pro/documentation and are meant to be read, copied and edited.
 *  What the note box needs is the opposite: something that organizes a note without putting
 *  words in the clinician's mouth or leaving `[findings]` behind in a saved record.
 *
 *  The headings match those templates section for section, so a clinician who reaches for the
 *  full version on the documentation page finds the same structure they have been typing into.
 *
 *  Client-safe — this seeds a textarea during render in a client component. */

export const NOTE_SCAFFOLD_HEADINGS: Readonly<Record<string, readonly string[]>> = {
  "Initial Eval": [
    "CHIEF COMPLAINT",
    "HISTORY OF PRESENT ILLNESS",
    "PAST MEDICAL HISTORY",
    "SOCIAL HISTORY",
    "SYSTEMS REVIEW",
    "TESTS AND MEASURES",
    "ASSESSMENT",
    "PLAN",
  ],
  // The one type whose headings are already the convention rather than a title — a SOAP note
  // written as four paragraphs under four all-caps banners would read as the wrong document.
  SOAP: ["S:", "O:", "A:", "P:"],
  "Progress Note": ["FUNCTIONAL PROGRESS", "OBJECTIVE MEASUREMENTS", "GOAL ACHIEVEMENT", "PLAN"],
  "Discharge Summary": [
    "REASON FOR DISCHARGE",
    "GOALS ACHIEVED",
    "FUNCTIONAL STATUS AT DISCHARGE",
    "HOME EXERCISE PROGRAM PROVIDED",
    "REFERRALS MADE",
    "PATIENT EDUCATION PROVIDED",
  ],
};

/** The scaffold for a note type: each heading, then a blank line to type into. Returns "" for
 *  a type with no scaffold, so an unrecognized one seeds an empty box rather than throwing. */
export function noteScaffold(noteType: string): string {
  const headings = NOTE_SCAFFOLD_HEADINGS[noteType];
  if (!headings) return "";
  return headings.map((h) => `${h}\n`).join("\n");
}

/** Whether this text is a scaffold nobody has written into yet — empty, or byte-for-byte one
 *  of the scaffolds above.
 *
 *  Two things depend on getting this right. Switching note type replaces the box's contents,
 *  and must never do that to a half-written note. And Save is disabled while it's true, so a
 *  scaffold with nothing filled in can't be saved as a note that merely looks complete. */
export function isUntouchedScaffold(text: string): boolean {
  if (!text.trim()) return true;
  return Object.keys(NOTE_SCAFFOLD_HEADINGS).some((type) => noteScaffold(type) === text);
}
