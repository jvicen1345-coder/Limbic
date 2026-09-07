/** Sleep and mood summaries for the Overview's Trends tab (see
 *  components/wellness/RecoverySection.tsx). Pure — rows in, numbers out, no prisma — the
 *  same split MetricsTrackingSection uses, so the page owns the queries and this stays
 *  testable and client-safe.
 *
 *  Both of these read data Limbic already stores and, until now, never showed anyone.
 *  SleepLog (one row per night, written by lib/google-health-sleep-sync.ts) had no reader
 *  anywhere in the app: that sync also mirrors the night's duration into MetricsLog as
 *  "sleepHours", which is what the trends chart plots, but minutesInBed/minutesAwake — the
 *  fields that make sleep *efficiency* computable — were written and dropped. MoodLog was
 *  read only by the Activity Log page that writes it, so a mood check-in never related to
 *  anything else a reader logged. */

export interface SleepNight {
  date: Date;
  minutesAsleep: number;
  minutesInBed: number | null;
}

export interface SleepSummary {
  /** Most recent night on record. */
  latest: SleepNight;
  /** Mean minutes asleep across the window. */
  averageMinutesAsleep: number;
  /** Mean of each night's own asleep/in-bed ratio as a percent, over just the nights that
   *  reported time in bed — null when none did. Averaging per-night ratios (rather than
   *  dividing the two totals) keeps one unusually long night from dominating the figure. */
  averageEfficiencyPercent: number | null;
  nightCount: number;
}

export function summarizeSleep(nights: SleepNight[]): SleepSummary | null {
  if (nights.length === 0) return null;
  const sorted = [...nights].sort((a, b) => b.date.getTime() - a.date.getTime());
  const totalAsleep = sorted.reduce((sum, n) => sum + n.minutesAsleep, 0);

  const withBedTime = sorted.filter((n) => n.minutesInBed != null && n.minutesInBed > 0);
  const efficiencies = withBedTime.map((n) => (n.minutesAsleep / n.minutesInBed!) * 100);
  const averageEfficiencyPercent =
    efficiencies.length > 0 ? efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length : null;

  return {
    latest: sorted[0],
    averageMinutesAsleep: totalAsleep / sorted.length,
    averageEfficiencyPercent,
    nightCount: sorted.length,
  };
}

/** "7h 20m" — minutes are what both the sync and the schema store, hours are what anyone
 *  actually reads a sleep figure in. */
export function formatSleepDuration(minutes: number): string {
  const rounded = Math.round(minutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export interface MoodSummary {
  /** Mean of every mood check-in in the window, on MoodLog's own 1 (Low) to 5 (Great) scale. */
  average: number;
  entryCount: number;
  /** Mean mood on days the reader also logged activity, and on days they didn't — null on
   *  either side when that side has no days to average, which is the common case early on.
   *  This is the one comparison that makes a mood check-in worth more than a diary entry,
   *  and it is deliberately reported as a plain observation: same-day self-report over a
   *  handful of days is an association, never evidence that the activity caused the mood. */
  activeDayAverage: number | null;
  restDayAverage: number | null;
}

/** `activeDateKeys` holds the local "YYYY-MM-DD" of every day with a VitalsLog entry, which
 *  is the same key MoodLog rows are bucketed by (see lib/limbic-calendar.ts dateToLocalIso)
 *  — comparing formatted local dates rather than timestamps keeps a late-evening workout and
 *  that evening's mood check-in on the same day regardless of UTC offset. */
export function summarizeMood(entries: { dateKey: string; mood: number }[], activeDateKeys: Set<string>): MoodSummary | null {
  if (entries.length === 0) return null;
  const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

  const active = entries.filter((e) => activeDateKeys.has(e.dateKey)).map((e) => e.mood);
  const rest = entries.filter((e) => !activeDateKeys.has(e.dateKey)).map((e) => e.mood);

  return {
    average: mean(entries.map((e) => e.mood)),
    entryCount: entries.length,
    activeDayAverage: active.length > 0 ? mean(active) : null,
    restDayAverage: rest.length > 0 ? mean(rest) : null,
  };
}

export const MOOD_SCALE_LABEL: Record<number, string> = {
  1: "Low",
  2: "Down",
  3: "Okay",
  4: "Good",
  5: "Great",
};

/** Nearest whole point on MoodLog's 1-5 scale, for labelling an average like 3.6 as "Good". */
export function moodLabel(value: number): string {
  const nearest = Math.min(5, Math.max(1, Math.round(value)));
  return MOOD_SCALE_LABEL[nearest];
}
