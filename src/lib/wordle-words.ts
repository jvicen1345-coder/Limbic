import { todayKeyInZone } from "@/lib/day";

// Curated bank of real 5-letter health/medical/wellness words — anatomy, symptoms,
// treatment, and wellness terms a PT, OT, or health-minded reader would recognize. All
// real dictionary words (some informal-but-standard clinical shorthand like "QUADS" or
// "ORTHO"), never invented spellings.
export const WORDLE_ANSWERS: string[] = [
  "NERVE", "ULNAR", "TIBIA", "FEMUR", "PULSE", "SPINE", "ANKLE", "ELBOW", "WRIST", "THIGH",
  "VAGUS", "VARUS", "BONES", "JOINT", "LUNGS", "HEART", "BRAIN", "LIVER", "RENAL", "SINUS",
  "GLAND", "NASAL", "ORGAN", "VOCAL", "SERUM", "VEINS", "VALVE", "ULCER", "STENT", "COLON",
  "ILIAC", "LYMPH", "AXONS", "PUPIL", "OVARY", "GLUTE", "QUADS", "CELLS", "GENES",
  "FEVER", "VIRUS", "TOXIN", "GERMS", "SPASM", "TOXIC", "STIFF", "ACUTE", "ACHES", "PAINS",
  "CRAMP", "THROB", "CHILL", "SWEAT", "FAINT", "DIZZY", "COUGH", "MUCUS", "VIRAL", "FUNGI",
  "YEAST", "SCARS", "BURNS", "WOUND",
  "BRACE", "GAUZE", "VOMIT", "DOSES", "PILLS", "SYRUP", "DETOX", "FIBER", "SALTS", "CARBS",
  "SUGAR", "VEGAN", "PALEO", "WATER", "STOOL", "URINE", "BLOOD", "CHEST", "VITAL", "LABOR",
  "NATAL", "ORTHO",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministic word of the day: the same word for every reader, changing once per
 *  calendar day. Derived from the date key itself (not an incrementing day count) so it
 *  stays stable as WORDLE_ANSWERS grows or shrinks over time. */
export function wordForDate(dateKey: string): string {
  const index = hashString(dateKey) % WORDLE_ANSWERS.length;
  return WORDLE_ANSWERS[index];
}

/** YYYY-MM-DD for "today" in the reader's own time zone — the unit the daily word rotates on.
 *  Takes the zone explicitly (see lib/user-time-zone.ts for where a request gets one)
 *  rather than reading the server's clock: this ran off UTC on a UTC server, so the day
 *  rolled over mid-evening for every reader in the Americas — see lib/day.ts. */
export function todayDateKey(timeZone: string): string {
  return todayKeyInZone(timeZone);
}
