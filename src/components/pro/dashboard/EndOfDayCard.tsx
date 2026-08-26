"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEndOfDaySummary, dismissEndOfDaySummary, type EndOfDaySummaryData } from "@/app/actions/clinician-dashboard";

// "After 4pm local time" per spec, checked purely client-side against the browser's own
// clock — no server involvement in the time gate itself, only in what getEndOfDaySummary
// computes once it's actually called.
const EOD_HOUR = 16;

/** Top of the Morning Rounds view (see MorningRounds.tsx) — self-fetching, since it needs
 *  its own client-side "is it past 4pm yet" check before it even asks the server for
 *  today's numbers. Renders nothing before 4pm, before the fetch resolves, or once
 *  dismissed for today. */
export function EndOfDayCard() {
  // No separate "is it past 4pm" state — the effect below only ever fetches (and
  // therefore only ever sets `summary`) once the client-side hour check passes, so
  // `summary` staying null doubles as "not past the cutoff yet" without a second flag.
  const [summary, setSummary] = useState<EndOfDaySummaryData | null>(null);
  const [hiddenLocally, setHiddenLocally] = useState(false);

  useEffect(() => {
    if (new Date().getHours() < EOD_HOUR) return;
    let cancelled = false;
    getEndOfDaySummary().then((data) => {
      if (!cancelled) setSummary(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!summary || summary.dismissed || hiddenLocally) return null;

  const handleDismiss = () => {
    setHiddenLocally(true);
    void dismissEndOfDaySummary();
  };

  return (
    <div className="card elev-sm clindash-eod-card">
      <div className="clindash-eod-header">End of Day</div>
      <div className="clindash-eod-grid">
        <div>
          <div className="clindash-eod-stat-value">{summary.patientsSeen}</div>
          <div className="clindash-eod-stat-label">Patients Seen Today</div>
        </div>
        <div>
          <div className="clindash-eod-stat-value">{summary.notesCompleted}</div>
          <div className="clindash-eod-stat-label">Notes Completed</div>
        </div>
        <div>
          <div className={`clindash-eod-stat-value${summary.notesOutstanding > 0 ? " clindash-eod-stat-value--danger" : ""}`}>
            {summary.notesOutstanding}
          </div>
          <div className="clindash-eod-stat-label">Notes Outstanding</div>
        </div>
        <div>
          <div className="clindash-eod-stat-value">{summary.ceHoursThisWeek}</div>
          <div className="clindash-eod-stat-label">CE Hours This Week</div>
        </div>
      </div>

      {summary.notesOutstanding > 0 && (
        <p className="clindash-eod-note">
          You have {summary.notesOutstanding} session {summary.notesOutstanding === 1 ? "note" : "notes"} to complete.
        </p>
      )}

      <div className="clindash-eod-actions">
        <button type="button" className="btn btn-secondary" onClick={handleDismiss}>
          Dismiss
        </button>
        <Link href="/pro/ce-tracker" className="btn btn-ghost" style={{ fontSize: 12.5 }}>
          Log CE Time
        </Link>
      </div>
    </div>
  );
}
