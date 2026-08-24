import "server-only";
import { prisma } from "@/lib/db";
import { VITALS_CATEGORIES, type VitalsCategory } from "@/lib/vitals";

/** Best-effort keyword mapping from a tracker/Health activity name to one of Limbic's 4
 *  Activity Log categories (see lib/vitals.ts) — every provider (Fitbit, Strava, an Apple
 *  Health export) names exercises differently, so this is the one place that guesses which
 *  bucket a given name belongs in, checked in order (most specific keyword wins). Falls
 *  back to "cardio" since most tracker-logged exercise is aerobic and that's the least
 *  wrong default for whatever doesn't match — a person can already see and correct the
 *  underlying activity name in the recent-logs list if the bucket looks off. */
export function mapActivityNameToCategory(rawName: string): VitalsCategory {
  const name = rawName.toLowerCase();
  if (/meditat|mindful|breath|relax/.test(name)) return "mindfulness";
  if (/yoga|stretch|pilates|mobility|foam.?roll/.test(name)) return "mobility";
  if (/weight|strength|resistance|crossfit|hiit|bootcamp|lifting/.test(name)) return "strength";
  return "cardio";
}

/** Turns an Apple `HKWorkoutActivityType...` / Strava `type` / Google Health `exerciseType`
 *  (e.g. "STRENGTH_TRAINING") into a short human-readable label for the Activity Log's
 *  "activity" column — strips the Apple HealthKit type prefix if present, splits
 *  underscore-separated enum values (Google Health) and camelCase ones (Apple/Strava) alike. */
export function humanizeActivityName(rawName: string): string {
  const stripped = rawName.replace(/^HKWorkoutActivityType/, "");
  if (stripped.includes("_")) {
    // "STRENGTH_TRAINING" -> "Strength Training".
    return stripped
      .split("_")
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
      .join(" ")
      .trim();
  }
  // A plain single-word enum value with no separator at all (Google Health's "RUNNING") —
  // title-case it rather than shouting it back in the Activity Log.
  if (/^[A-Z]+$/.test(stripped)) {
    return stripped[0] + stripped.slice(1).toLowerCase();
  }
  // Splits "TraditionalStrengthTraining" into "Traditional Strength Training".
  return stripped.replace(/([a-z])([A-Z])/g, "$1 $2").trim() || rawName;
}

export interface SyncedActivityEntry {
  /** Local ISO "YYYY-MM-DD". */
  date: string;
  category: VitalsCategory;
  minutes: number;
  activity: string;
}

/** Writes one synced entry, replacing any existing row for the same userId/date/category/
 *  source rather than accumulating — the same idempotent-upsert semantics documented on
 *  VitalsLog.source in schema.prisma, shared now by the Apple Health Shortcut endpoint,
 *  the Fitbit/Strava cron sync, and a manual Apple Health export upload, so re-running any
 *  of them for a day already synced updates that day's numbers instead of double-counting. */
export async function upsertSyncedVitalsLog(
  userId: string,
  source: string,
  entry: SyncedActivityEntry
): Promise<void> {
  const dayDate = new Date(`${entry.date}T00:00:00`);
  const existing = await prisma.vitalsLog.findFirst({
    where: { userId, date: dayDate, category: entry.category, source },
  });
  if (existing) {
    await prisma.vitalsLog.update({
      where: { id: existing.id },
      data: { minutes: entry.minutes, activity: entry.activity },
    });
  } else {
    await prisma.vitalsLog.create({
      data: { userId, date: dayDate, category: entry.category, minutes: entry.minutes, activity: entry.activity, source },
    });
  }
}

export function isVitalsCategory(value: unknown): value is VitalsCategory {
  return typeof value === "string" && (VITALS_CATEGORIES as readonly string[]).includes(value);
}

/** A Google Health "CivilDateTime" — local wall-clock date/time in whatever timezone the
 *  wearer's device was in, alongside the interval's own UTC startTime/endTime (see
 *  developers.google.com/health/reference/rest, ObservationTimeInterval/SessionTimeInterval:
 *  both carry civilStartTime/civilEndTime "output only" fields for exactly this reason —
 *  grouping by day should use the wearer's day, not a UTC day that can be off by one). */
export interface GoogleHealthCivilDateTime {
  year: number;
  month: number;
  day: number;
}

export interface GoogleHealthInterval {
  startTime: string; // RFC 3339, UTC
  endTime: string; // RFC 3339, UTC
  civilStartTime?: GoogleHealthCivilDateTime;
}

/** Prefers the wearer's local (civil) date over the UTC startTime, which can land on the
 *  wrong day for anyone not near UTC — falls back to the UTC date if civilStartTime is ever
 *  missing from a response (documented as present, but "output only" fields on a new API are
 *  worth not hard-depending on). Shared by every Google Health sync that groups interval-
 *  shaped data points by day (exercise, nutrition log entries, sleep sessions). */
export function localDateFromGoogleHealthInterval(interval: GoogleHealthInterval | undefined): string | null {
  if (!interval) return null;
  if (interval.civilStartTime) {
    const { year, month, day } = interval.civilStartTime;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return interval.startTime ? interval.startTime.slice(0, 10) : null;
}
