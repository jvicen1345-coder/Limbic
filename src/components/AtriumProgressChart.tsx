import Link from "next/link";
import { ZapIcon, ChevronRightIcon } from "@/components/icons";
import { domainSlug } from "@/lib/board-content";

export interface DomainAccuracy {
  domain: string;
  correct: number;
  total: number;
  color: string;
}

const RING_SIZE = 100;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Replaces the old "Daily Sharpening" + "Boards Progress" text cards with one visual —
 *  a weekly-completion ring (same "days out of 7" figure Boards' own streak-dot row
 *  already tracks) paired with a per-domain accuracy breakdown from this week's Boards
 *  answers. Pure presentation — see app/(app)/student/page.tsx for where the real
 *  BoardActivity/DailyCompletion data this renders gets computed. The Daily Clinical
 *  Sharpening CTA at the bottom used to be its own full-width card lower on the Atrium
 *  page (see .atrium-primary-card in an earlier revision) — folded in here since it's the
 *  same "keep your streak alive today" idea this card is already built around, not a
 *  separate one. No "completed today" signal is fetched for /student/clinical-sharpening
 *  anywhere on the Atrium (unlike the Boards activity this card's own ring is built from),
 *  so the CTA always renders the start state rather than guessing completion from
 *  unrelated data. */
export function AtriumProgressChart({
  daysCompletedThisWeek,
  currentStreak,
  domains,
}: {
  /** 0-7 — how many of the last 7 calendar days had any Boards activity. */
  daysCompletedThisWeek: number;
  currentStreak: number;
  /** All 5 NPTE domains, correct/total both 0 for a domain not yet touched this week —
   *  shown as "no data yet" rather than omitted, so the legend's shape stays constant. */
  domains: DomainAccuracy[];
}) {
  const hasAnyData = domains.some((d) => d.total > 0);
  const fillFraction = Math.max(0, Math.min(1, daysCompletedThisWeek / 7));
  const dashOffset = RING_CIRCUMFERENCE * (1 - fillFraction);

  return (
    <div className="atrium-progress-card">
      <div className="atrium-progress-top">
        <div className="atrium-progress-ring-wrap">
          <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} aria-hidden="true">
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="var(--atrium-border)"
              strokeWidth={RING_STROKE}
            />
            {daysCompletedThisWeek > 0 && (
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="var(--atrium-tint)"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                // Starts the fill at 12 o'clock instead of SVG's default 3 o'clock —
                // rotated around the circle's own center, not the viewBox origin.
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            )}
          </svg>
          <div className="atrium-progress-ring-center">
            <div className="atrium-progress-ring-number">{daysCompletedThisWeek}</div>
            {daysCompletedThisWeek > 0 ? (
              <div className="atrium-progress-ring-label">of 7 days</div>
            ) : (
              <div className="atrium-progress-ring-label atrium-progress-ring-label--empty">Start your streak today</div>
            )}
          </div>
        </div>

        <div className="atrium-progress-details">
          <div className="atrium-progress-streak">
            <ZapIcon size={14} />
            {currentStreak > 0 ? `${currentStreak} day${currentStreak === 1 ? "" : "s"} streak` : "No streak yet"}
          </div>

          {!hasAnyData && (
            <p className="atrium-dashboard-empty" style={{ margin: 0 }}>
              Your readiness builds one day at a time. Tap a domain below to start practicing it.
            </p>
          )}
          <div className="atrium-progress-domains">
            {domains.map((d) => (
              <Link href={`/student/domains/${domainSlug(d.domain)}`} className="atrium-progress-domain-row" key={d.domain}>
                <span className="atrium-progress-domain-swatch" style={{ background: d.color }} aria-hidden="true" />
                <span className="atrium-progress-domain-name">{d.domain}</span>
                <div className="progress-bar atrium-progress-domain-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: d.total > 0 ? `${Math.round((d.correct / d.total) * 100)}%` : "0%",
                      background: d.color,
                    }}
                  />
                </div>
                <span className="atrium-progress-domain-frac">{d.total > 0 ? `${d.correct}/${d.total}` : "Not yet"}</span>
                <ChevronRightIcon size={14} className="atrium-progress-domain-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="atrium-progress-cta">
        <div className="atrium-progress-cta-text">
          <p className="atrium-progress-cta-title">Daily Clinical Sharpening</p>
          <p className="atrium-progress-cta-desc">One question. One term. One case. Five minutes keeps your streak alive.</p>
        </div>
        <Link href="/student/clinical-sharpening" className="btn btn-primary atrium-progress-cta-btn">
          Start Today&rsquo;s Sharpening
        </Link>
      </div>
    </div>
  );
}
