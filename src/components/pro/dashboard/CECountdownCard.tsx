"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCECountdown, type CECountdown } from "@/app/actions/clinician-dashboard";

const GREEN_THRESHOLD_DAYS = 180;
const AMBER_THRESHOLD_DAYS = 60;

function daysColor(days: number): string {
  if (days > GREEN_THRESHOLD_DAYS) return "var(--color-success)";
  if (days >= AMBER_THRESHOLD_DAYS) return "#c9853a";
  return "var(--color-danger)";
}

/** Right column, above the research feed — self-fetching, shown regardless of whether a
 *  patient is selected (unlike the research digest / question log below it, which are
 *  default-mode only). Read-only: reads the same User.ceLicenseExpiry / ceTotalRequired
 *  fields as the CE Tracker page (see getCECountdown's own comment), but never writes them
 *  itself — CE Tracker's own fuller form (state, expiration, renewal cycle, required
 *  hours) is the one place to set or change a renewal date, so this card doesn't duplicate
 *  a second, narrower copy of that form. */
export function CECountdownCard() {
  const [countdown, setCountdown] = useState<CECountdown | null | undefined>(undefined);

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

  if (!countdown) {
    return (
      <div className="card elev-sm clindash-ce-card">
        <div className="card-kicker" style={{ margin: 0 }}>
          CE Renewal
        </div>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
          Set your renewal date in CE Tracker to see your countdown here.
        </p>
        <div className="clindash-ce-actions">
          <Link href="/pro/ce-tracker" className="btn btn-secondary" style={{ fontSize: 12 }}>
            Go to CE Tracker
          </Link>
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
      </div>
    </div>
  );
}
