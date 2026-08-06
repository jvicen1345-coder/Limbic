import Link from "next/link";
import { VITALS_CATEGORIES, VITALS_CATEGORY_LABEL, type VitalsCategory } from "@/lib/vitals";

/** Wellness overview's mini preview of this week's Vitals activity — a compact horizontal
 *  version of the same per-category bars the full /wellness/vitals chart uses, reusing the
 *  same vitals-color-* tokens so the two never show different colors for the same category. */
export function VitalsPreviewCard({ totals, totalMinutes }: { totals: Record<VitalsCategory, number>; totalMinutes: number }) {
  const max = Math.max(1, ...VITALS_CATEGORIES.map((c) => totals[c]));

  return (
    <div className="card elev-sm" style={{ flex: 1, minWidth: 220 }}>
      <div className="card-kicker">Vitals</div>
      {totalMinutes === 0 ? (
        <p className="card-body" style={{ marginTop: 4 }}>
          Start tracking your activity
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {VITALS_CATEGORIES.map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10.5, width: 72, color: "var(--color-neutral-700)", flexShrink: 0 }}>{VITALS_CATEGORY_LABEL[c]}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                <div className={`vitals-color-${c}`} style={{ height: "100%", width: `${(totals[c] / max) * 100}%`, borderRadius: 999 }} />
              </div>
              <span style={{ fontSize: 10.5, color: "var(--color-neutral-700)", width: 34, textAlign: "right", flexShrink: 0 }}>{totals[c]}m</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/wellness/vitals" style={{ fontSize: 12.5, color: "var(--color-accent-700)", marginTop: 12, display: "inline-block" }}>
        → Go to Vitals
      </Link>
    </div>
  );
}
