import "server-only";
import AdmZip from "adm-zip";
import { mapActivityNameToCategory, humanizeActivityName, type SyncedActivityEntry } from "@/lib/fitness-sync";
import type { VitalsCategory } from "@/lib/vitals";

/** Caps on the uploaded zip and the export.xml it contains — a real "Export All Health
 *  Data" from a longtime Apple Watch wearer can run into the hundreds of MB, almost all of
 *  it step-count/heart-rate samples we don't read at all. Rather than a full DOM parse
 *  (which would build a JS object for every one of those irrelevant records), this module
 *  regex-matches just the opening tags of <Workout> and mindful-session <Record> elements
 *  and ignores everything else in the file — but a bound is still needed so a single
 *  upload can't tie up a serverless function's memory/time indefinitely. Above these caps
 *  the reader is pointed at the Shortcut/tracker sync instead, which have no such limit. */
export const MAX_ZIP_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_XML_BYTES = 150 * 1024 * 1024; // 150 MB decompressed

export class AppleHealthImportError extends Error {}

/** Pulls double-quoted `name="value"` pairs out of one XML opening tag's attribute text —
 *  deliberately not a general XML attribute parser (no entity decoding beyond the handful
 *  Apple's own exporter emits), just enough for the flat, well-formed attributes Health's
 *  export always uses. */
function parseAttributes(attrText: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([A-Za-z:][\w:.-]*)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrText))) {
    attrs[match[1]] = match[2]
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }
  return attrs;
}

const DURATION_UNIT_TO_MINUTES: Record<string, number> = { min: 1, sec: 1 / 60, hr: 60 };

/** Extracts one export.xml's workouts + mindful-minute sessions, grouped into the same
 *  per-day/per-category shape the Fitbit/Strava sync already upserts (see
 *  lib/fitness-sync.ts) — the caller (app/actions/fitness-import.ts) does the actual
 *  VitalsLog writes so this stays a pure, easily-tested function. */
export function parseAppleHealthExportXml(xml: string): SyncedActivityEntry[] {
  const byDayCategory = new Map<string, { minutes: number; names: string[] }>();

  const addMinutes = (date: string, category: VitalsCategory, minutes: number, name: string) => {
    if (!date || minutes <= 0) return;
    const key = `${date}|${category}`;
    const bucket = byDayCategory.get(key) ?? { minutes: 0, names: [] };
    bucket.minutes += minutes;
    bucket.names.push(name);
    byDayCategory.set(key, bucket);
  };

  const workoutTagRe = /<Workout\b([^>]*)>/g;
  let m: RegExpExecArray | null;
  while ((m = workoutTagRe.exec(xml))) {
    const attrs = parseAttributes(m[1]);
    const rawType = attrs.workoutActivityType ?? "Workout";
    const durationValue = Number.parseFloat(attrs.duration ?? "");
    const unitFactor = DURATION_UNIT_TO_MINUTES[attrs.durationUnit ?? "min"] ?? 1;
    if (!Number.isFinite(durationValue)) continue;
    const minutes = Math.round(durationValue * unitFactor);
    const date = (attrs.startDate ?? "").slice(0, 10);
    addMinutes(date, mapActivityNameToCategory(rawType), minutes, humanizeActivityName(rawType));
  }

  // Apple's export dates look like "2026-08-20 21:00:00 -0700" — valid to Date.parse only
  // once the date/time space becomes "T" and the space before the offset is gone entirely
  // (a lone space there makes the whole string unparseable, silently returning NaN).
  const toParsableDate = (raw: string): string => raw.replace(" ", "T").replace(/ /g, "");

  const mindfulTagRe = /<Record\b([^>]*)>/g;
  while ((m = mindfulTagRe.exec(xml))) {
    const attrs = parseAttributes(m[1]);
    if (attrs.type !== "HKCategoryTypeIdentifierMindfulSession") continue;
    const start = Date.parse(attrs.startDate ? toParsableDate(attrs.startDate) : "");
    const end = Date.parse(attrs.endDate ? toParsableDate(attrs.endDate) : "");
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const minutes = Math.round((end - start) / 60000);
    const date = (attrs.startDate ?? "").slice(0, 10);
    addMinutes(date, "mindfulness", minutes, "Meditation");
  }

  const entries: SyncedActivityEntry[] = [];
  for (const [key, bucket] of byDayCategory) {
    const [date, category] = key.split("|") as [string, VitalsCategory];
    entries.push({
      date,
      category,
      minutes: bucket.minutes,
      activity: bucket.names.length <= 2 ? bucket.names.join(", ") : `${bucket.names.length} activities`,
    });
  }
  return entries;
}

/** Unzips an "Export All Health Data" archive and hands its export.xml to
 *  parseAppleHealthExportXml. Throws AppleHealthImportError with a message safe to show
 *  the reader directly for anything that isn't really a Health export. */
export function parseAppleHealthExportZip(zipBuffer: Buffer): SyncedActivityEntry[] {
  let zip: AdmZip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch {
    throw new AppleHealthImportError("That doesn't look like a zip file.");
  }

  const entry = zip.getEntries().find((e) => e.entryName.toLowerCase().endsWith("export.xml"));
  if (!entry) throw new AppleHealthImportError("No export.xml found in that zip — is this the Health app's export?");
  if (entry.header.size > MAX_XML_BYTES) {
    throw new AppleHealthImportError("That export is larger than Limbic can process — try the Shortcut sync instead for full history.");
  }

  const xml = entry.getData().toString("utf-8");
  return parseAppleHealthExportXml(xml);
}
