import Link from "next/link";
import {
  formatSleepDuration,
  moodLabel,
  type MoodSummary,
  type SleepSummary,
} from "@/lib/wellness-recovery";

/** The Overview Trends tab's Recovery block — sleep and mood, the two things Limbic already
 *  records about how a reader is actually doing rather than what they did. Both were
 *  invisible before this: SleepLog had no reader anywhere in the app, and MoodLog was only
 *  ever shown on the Activity Log page that writes it. See lib/wellness-recovery.ts for the
 *  summaries themselves and why each is computed the way it is.
 *
 *  Renders nothing at all when there's neither sleep nor mood on record — an empty Recovery
 *  heading over two "no data" cards would just be noise on a tab that already leads with the
 *  metrics chart's own empty state. */
export function RecoverySection({
  sleep,
  mood,
  moodWindowDays,
}: {
  sleep: SleepSummary | null;
  mood: MoodSummary | null;
  moodWindowDays: number;
}) {
  if (!sleep && !mood) return null;

  return (
    <div className="wellness-recovery">
      <div className="wellness-tracking-label wellness-recovery-heading">Recovery</div>
      <div className="wellness-recovery-grid">
        {sleep && (
          <div className="wellness-recovery-card">
            <div className="wellness-recovery-card-head">
              <span className="wellness-recovery-card-title">Sleep</span>
              <span className="wellness-recovery-card-note">
                {sleep.nightCount} {sleep.nightCount === 1 ? "night" : "nights"} synced
              </span>
            </div>
            <div className="wellness-recovery-stats">
              <div className="wellness-recovery-stat">
                <div className="wellness-recovery-stat-value">{formatSleepDuration(sleep.latest.minutesAsleep)}</div>
                <div className="wellness-recovery-stat-label">Last night</div>
              </div>
              <div className="wellness-recovery-stat">
                <div className="wellness-recovery-stat-value">{formatSleepDuration(sleep.averageMinutesAsleep)}</div>
                <div className="wellness-recovery-stat-label">Nightly average</div>
              </div>
              {sleep.averageEfficiencyPercent != null && (
                <div className="wellness-recovery-stat">
                  <div className="wellness-recovery-stat-value">{Math.round(sleep.averageEfficiencyPercent)}%</div>
                  {/* The one figure here that isn't just duration — time actually asleep as a
                      share of time in bed, which is what separates "eight hours in bed" from
                      eight hours of sleep. */}
                  <div className="wellness-recovery-stat-label">Sleep efficiency</div>
                </div>
              )}
            </div>
          </div>
        )}

        {mood && (
          <div className="wellness-recovery-card">
            <div className="wellness-recovery-card-head">
              <span className="wellness-recovery-card-title">Mood</span>
              <span className="wellness-recovery-card-note">
                {mood.entryCount} {mood.entryCount === 1 ? "check-in" : "check-ins"} in {moodWindowDays} days
              </span>
            </div>
            <div className="wellness-recovery-stats">
              <div className="wellness-recovery-stat">
                <div className="wellness-recovery-stat-value">{mood.average.toFixed(1)}</div>
                <div className="wellness-recovery-stat-label">Average &mdash; {moodLabel(mood.average)}</div>
              </div>
              {mood.activeDayAverage != null && (
                <div className="wellness-recovery-stat">
                  <div className="wellness-recovery-stat-value">{mood.activeDayAverage.toFixed(1)}</div>
                  <div className="wellness-recovery-stat-label">On days you logged activity</div>
                </div>
              )}
              {mood.restDayAverage != null && (
                <div className="wellness-recovery-stat">
                  <div className="wellness-recovery-stat-value">{mood.restDayAverage.toFixed(1)}</div>
                  <div className="wellness-recovery-stat-label">On rest days</div>
                </div>
              )}
            </div>
            {mood.activeDayAverage != null && mood.restDayAverage != null && (
              /* Stated as an observation, never a claim about cause: this is a handful of
                 same-day self-reports, so it can show the two averages differ and nothing
                 more. Same "general wellness, not medical advice" line the rest of this
                 section holds (see components/vitals/WellnessDisclaimer.tsx). */
              <p className="wellness-recovery-caption">
                An observation from your own check-ins over {moodWindowDays} days, not a cause-and-effect finding.
              </p>
            )}
            <Link href="/wellness/activity" className="wellness-snapshot-link">
              Check in for today &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
