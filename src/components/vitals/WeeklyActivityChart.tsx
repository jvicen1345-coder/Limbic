import { VITALS_CATEGORIES, VITALS_CATEGORY_LABEL, addDaysIso, type VitalsCategory, type WeekSummary } from "@/lib/vitals";

const TRACK_HEIGHT_PX = 140;
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayTotal(day: Record<VitalsCategory, number>): number {
  return VITALS_CATEGORIES.reduce((sum, c) => sum + day[c], 0);
}

/** No client state at all — the hover tooltip is pure CSS (see .vitals-chart-segment in
 *  globals.css), so this can render inside the client Vitals page without needing its own
 *  "use client" directive. */
export function WeeklyActivityChart({ thisWeek, lastWeek, weekStartIso }: { thisWeek: WeekSummary; lastWeek: WeekSummary; weekStartIso: string }) {
  if (thisWeek.totalMinutes === 0 && lastWeek.totalMinutes === 0) {
    return <div className="vitals-chart-empty">Start logging your activity below to see your weekly progress.</div>;
  }

  const maxDayTotal = Math.max(1, ...thisWeek.days.map(dayTotal), ...lastWeek.days.map(dayTotal));

  return (
    <>
      <div className="vitals-chart-wrap">
        <div className="vitals-chart-days">
          {thisWeek.days.map((day, i) => {
            const ghostDay = lastWeek.days[i];
            const barHeight = (dayTotal(day) / maxDayTotal) * TRACK_HEIGHT_PX;
            const ghostHeight = (dayTotal(ghostDay) / maxDayTotal) * TRACK_HEIGHT_PX;
            const iso = addDaysIso(weekStartIso, i);
            const isToday = iso === new Date().toISOString().slice(0, 10); // best-effort highlight only
            return (
              <div key={i} className="vitals-chart-day">
                <div className="vitals-chart-track">
                  <div className="vitals-chart-ghost" style={{ height: ghostHeight }}>
                    {VITALS_CATEGORIES.map((c) =>
                      ghostDay[c] > 0 ? (
                        <div
                          key={c}
                          className={`vitals-chart-segment vitals-color-${c}`}
                          style={{ height: (ghostDay[c] / maxDayTotal) * TRACK_HEIGHT_PX }}
                        />
                      ) : null
                    )}
                  </div>
                  <div className="vitals-chart-bar" style={{ height: barHeight }}>
                    {VITALS_CATEGORIES.map((c) =>
                      day[c] > 0 ? (
                        <div key={c} className={`vitals-chart-segment vitals-color-${c}`} style={{ height: (day[c] / maxDayTotal) * TRACK_HEIGHT_PX }}>
                          <span className="vitals-chart-tooltip">
                            {VITALS_CATEGORY_LABEL[c]} · {day[c]} min
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
                <div className="vitals-chart-daylabel" style={{ color: isToday ? "var(--color-accent-700)" : undefined }}>
                  {WEEKDAY_LABELS[i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="vitals-chart-legend">
        {VITALS_CATEGORIES.map((c) => (
          <div key={c} className="vitals-chart-legend-item">
            <span className={`vitals-chart-legend-dot vitals-color-${c}`} />
            <span>{VITALS_CATEGORY_LABEL[c]}</span>
            <span className="vitals-chart-legend-total">— {thisWeek.totals[c]} min</span>
          </div>
        ))}
      </div>
    </>
  );
}
