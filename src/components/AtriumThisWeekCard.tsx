"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleAssignmentComplete } from "@/app/actions/syllabus";
import type { PlatformRecommendation } from "@/lib/atrium-recommendations";

export interface ThisWeekAssignment {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  courseCode: string;
  completed: boolean;
}

const CATEGORY_DOT_COLOR: Record<string, string> = {
  Exam: "var(--color-danger)",
  Quiz: "var(--color-warn)",
  "Lab Practical": "#7c3aed",
  Assignment: "var(--color-accent)",
  Paper: "var(--color-success)",
};

function localDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function urgencyColor(dueDate: string, todayKey: string, tomorrowKey: string): string {
  if (dueDate === todayKey) return "#dc2626";
  if (dueDate === tomorrowKey) return "#c9853a";
  return "var(--color-text)";
}

// T00:00:00 suffix, not a bare `new Date(dueDate)` — same fix as the Atrium's own break-card
// subtitle (see app/(app)/student/page.tsx) for the same reason: parsing a date-only string
// without a local time component reads it as UTC midnight, which renders as the previous day
// in any timezone west of UTC.
function formatDueDate(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Replaces the Weekly Roundup card in the Atrium's right column (see
 *  app/(app)/student/page.tsx) — everything here is read from props the server page already
 *  fetched (see app/actions/syllabus.ts getThisWeekAssignments, lib/atrium-recommendations.ts
 *  getWeekRecommendations); the only mutation this component makes itself is the completion
 *  checkbox, via toggleAssignmentComplete. Weekly Roundup itself is untouched — it never
 *  appeared on /home to begin with (see lib/student-roundup.ts, only ever read by this page
 *  and app/(app)/student/roundup/page.tsx), so nothing elsewhere needed to change for it to
 *  keep working exactly as it did. */
export function AtriumThisWeekCard({
  weekLabel,
  assignments,
  hasSyllabi,
  recommendations,
  npteDays,
  npteProgressPercent,
}: {
  weekLabel: string;
  assignments: ThisWeekAssignment[];
  hasSyllabi: boolean;
  recommendations: PlatformRecommendation[];
  npteDays: number | null;
  npteProgressPercent: number | null;
}) {
  const [rows, setRows] = useState(assignments);
  const [, startTransition] = useTransition();
  const [showAllRecs, setShowAllRecs] = useState(false);

  const todayKey = localDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = localDateKey(tomorrow);

  function handleToggle(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
    startTransition(async () => {
      const result = await toggleAssignmentComplete(id);
      if ("error" in result) {
        // Revert on failure — same optimistic-then-reconcile shape as every other
        // checkbox-style mutation in this app.
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
      }
    });
  }

  const visibleRecommendations = showAllRecs ? recommendations : recommendations.slice(0, 3);

  return (
    <aside className="atrium-week-panel atrium-zone-roundup">
      <div className="atrium-week-header">
        <span className="atrium-week-title">This Week</span>
        <span className="atrium-week-range">{weekLabel}</span>
      </div>

      {!hasSyllabi ? (
        <div className="atrium-week-empty-prompt">
          <p>Upload your syllabi to track assignments here.</p>
          <Link href="/student/syllabi" className="btn btn-secondary atrium-week-empty-cta">
            Add Syllabus
          </Link>
        </div>
      ) : rows.length === 0 ? (
        <div>
          <p className="atrium-dashboard-empty">No assignments due this week</p>
          <Link href="/student/syllabi" className="atrium-week-add-link">
            Add your syllabus →
          </Link>
        </div>
      ) : (
        <div className="atrium-week-assignments">
          {rows.map((a) => (
            <label key={a.id} className={a.completed ? "atrium-week-assignment atrium-week-assignment--done" : "atrium-week-assignment"}>
              <input type="checkbox" checked={a.completed} onChange={() => handleToggle(a.id)} />
              <span className="atrium-week-assignment-due" style={{ color: a.completed ? "var(--color-neutral-700)" : urgencyColor(a.dueDate, todayKey, tomorrowKey) }}>
                {formatDueDate(a.dueDate)}
              </span>
              <span className="atrium-week-assignment-title">{a.title}</span>
              <span className="atrium-week-assignment-course">{a.courseCode}</span>
              <span
                className="atrium-week-assignment-dot"
                style={{ background: CATEGORY_DOT_COLOR[a.category] ?? "var(--color-neutral-700)" }}
                aria-hidden="true"
              />
            </label>
          ))}
        </div>
      )}

      <div className="atrium-week-divider" />

      <div className="atrium-week-recs">
        <p className="atrium-week-recs-title">On Limbic This Week</p>
        {visibleRecommendations.map((rec) => (
          <Link key={rec.route} href={rec.route} className="atrium-week-rec-row">
            <span
              className="atrium-week-rec-dot"
              style={{ background: rec.priority === "high" ? "var(--color-success)" : "var(--color-warn)" }}
              aria-hidden="true"
            />
            <span className="atrium-week-rec-body">
              <span className="atrium-week-rec-title">{rec.title}</span>
              <span className="atrium-week-rec-desc">{rec.description}</span>
            </span>
          </Link>
        ))}
        {recommendations.length > 3 && (
          <button type="button" className="atrium-week-recs-toggle" onClick={() => setShowAllRecs((v) => !v)}>
            {showAllRecs ? "Show fewer" : "See all recommendations"}
          </button>
        )}
      </div>

      <div className="atrium-npte-countdown">
        <p className="atrium-npte-countdown-label">NPTE Countdown</p>
        {npteDays !== null && npteDays >= 0 ? (
          <>
            <p className={`atrium-npte-countdown-number atrium-npte-countdown-number--${npteDays > 180 ? "green" : npteDays >= 60 ? "amber" : "red"}`}>
              {npteDays}
            </p>
            <p className="atrium-npte-countdown-sub">days until boards</p>
            {npteProgressPercent !== null && (
              <div className="atrium-npte-progress-track">
                <div className="atrium-npte-progress-fill" style={{ width: `${npteProgressPercent}%` }} />
              </div>
            )}
          </>
        ) : (
          <p className="atrium-npte-countdown-empty">
            Set your NPTE exam date in <Link href="/profile#program-timeline">Profile Settings</Link>
          </p>
        )}
      </div>
    </aside>
  );
}
