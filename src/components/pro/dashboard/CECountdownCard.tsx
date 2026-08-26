"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getCECountdown, upsertCERenewalDate, type CECountdown } from "@/app/actions/clinician-dashboard";

const GREEN_THRESHOLD_DAYS = 180;
const AMBER_THRESHOLD_DAYS = 60;

function daysColor(days: number): string {
  if (days > GREEN_THRESHOLD_DAYS) return "var(--color-success)";
  if (days >= AMBER_THRESHOLD_DAYS) return "#c9853a";
  return "var(--color-danger)";
}

/** Right column, above the research feed — self-fetching, shown regardless of whether a
 *  patient is selected (unlike the research digest / question log below it, which are
 *  default-mode only). Reads/writes the same User.ceLicenseExpiry / ceTotalRequired fields
 *  as the CE Tracker page (see getCECountdown's own comment). */
export function CECountdownCard() {
  const [pending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState<CECountdown | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [renewalDate, setRenewalDate] = useState("");
  const [totalRequired, setTotalRequired] = useState("30");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCECountdown().then((result) => {
      if (!cancelled) setCountdown(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (countdown === undefined) return null;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await upsertCERenewalDate(renewalDate, Number(totalRequired));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const fresh = await getCECountdown();
      setCountdown(fresh);
      setEditing(false);
    });
  };

  if (!countdown || editing) {
    return (
      <div className="card elev-sm clindash-ce-card">
        <div className="card-kicker" style={{ margin: 0 }}>
          {countdown ? "Edit Renewal Date" : "Track your CE renewal deadline"}
        </div>
        <div className="clindash-inline-form-row" style={{ marginTop: 10 }}>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="ce-renewal-date">Renewal date</label>
            <input
              className="input"
              id="ce-renewal-date"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="ce-total-required">Total hours required</label>
            <input
              className="input"
              id="ce-total-required"
              type="number"
              min="1"
              value={totalRequired}
              onChange={(e) => setTotalRequired(e.target.value)}
            />
          </div>
        </div>
        {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "8px 0 0" }}>{error}</p>}
        <div className="clindash-ce-actions">
          <button type="button" className="btn btn-primary" disabled={pending || !renewalDate} onClick={handleSave}>
            {pending ? "Saving…" : "Save"}
          </button>
          {countdown && (
            <button type="button" className="clindash-ce-edit-link" onClick={() => setEditing(false)} disabled={pending}>
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = countdown.hoursRequired > 0 ? Math.min(100, Math.round((countdown.hoursCompleted / countdown.hoursRequired) * 100)) : 0;

  return (
    <div className="card elev-sm clindash-ce-card">
      <div className="card-kicker" style={{ margin: 0 }}>
        CE Renewal
      </div>
      <div className="clindash-ce-days" style={{ color: daysColor(countdown.daysUntilRenewal) }}>
        {countdown.daysUntilRenewal}
      </div>
      <div className="clindash-ce-days-label">days until license renewal</div>

      <div className="clindash-ce-progress-bar">
        <div className="clindash-ce-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="clindash-ce-hours-line">
        {countdown.hoursCompleted} of {countdown.hoursRequired} hours completed
      </div>
      <div className="clindash-ce-hours-line">{countdown.hoursRemaining} hours remaining</div>

      <span className={`clindash-ce-track-pill ${countdown.onTrack ? "clindash-ce-track-pill--on" : "clindash-ce-track-pill--behind"}`}>
        {countdown.onTrack ? "On track" : "Falling behind"}
      </span>

      <div className="clindash-ce-actions">
        <Link href="/pro/ce-tracker" className="btn btn-secondary" style={{ fontSize: 12 }}>
          Log CE Time
        </Link>
        <button
          type="button"
          className="clindash-ce-edit-link"
          onClick={() => {
            setRenewalDate(countdown.renewalDate.toISOString().slice(0, 10));
            setTotalRequired(String(countdown.hoursRequired));
            setEditing(true);
          }}
        >
          Edit renewal date
        </button>
      </div>
    </div>
  );
}
