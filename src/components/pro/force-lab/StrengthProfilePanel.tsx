import { bodyRegions } from "@/lib/force-lab-muscles";
import { FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED, convertForDisplay } from "@/lib/force-lab-units";
import type { StrengthProfileEntry } from "@/app/actions/force-lab";

function lsiColor(lsi: number | null): string {
  if (lsi == null) return "var(--color-neutral-400, #9aa3ad)";
  if (lsi >= 90) return FORCE_LAB_GREEN;
  if (lsi >= 80) return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Strength Profile — the right column's compact version and the patient session page's
 *  full-width version share this one component (`layout` only changes column count via
 *  CSS, see .forcelab-profile-regions--full below).
 *
 *  Bar width is the entry's own LSI (left/right symmetry) percentage, matching the color
 *  and the printed "NN%" — never the norm-based percentage the spec also describes: a norm
 *  lookup needs the patient's age and sex, and this app deliberately stores neither anywhere
 *  (ClinicalPatient has no PHI fields at all — patients are referenced only by
 *  clinician-assigned code, see that model's own schema.prisma comment) — age/sex only ever
 *  exist as transient, per-session form state for Section 3's live normative comparison at
 *  entry time, never persisted. A saved session has no age/sex to look a norm back up with
 *  later, so this view can only ever fall back to the spec's own "if no norm" behavior.
 *  (Bar width used to be raw peak force scaled to the region's max tested value, so a
 *  perfectly symmetric 99% LSI muscle could still render as a half-empty bar next to a
 *  stronger-but-less-symmetric one in the same region — confusing since the color and
 *  number both read as "good." LSI is already a 0-100 percentage, so no per-region scaling
 *  is needed here the way raw force values needed one.) */
export function StrengthProfilePanel({
  profile,
  forceUnit,
  layout = "compact",
}: {
  profile: StrengthProfileEntry[];
  forceUnit: string;
  layout?: "compact" | "full";
}) {
  const byRegion = new Map<string, StrengthProfileEntry[]>();
  for (const entry of profile) {
    const list = byRegion.get(entry.bodyRegion) ?? [];
    list.push(entry);
    byRegion.set(entry.bodyRegion, list);
  }

  return (
    <div className={layout === "full" ? "forcelab-profile-regions forcelab-profile-regions--full" : "forcelab-profile-regions"}>
      {bodyRegions.map((region) => {
        const entries = byRegion.get(region);
        if (!entries || entries.length === 0) {
          return (
            <div className="forcelab-profile-region" key={region}>
              <div className="forcelab-profile-region-title">{region}</div>
              <p className="forcelab-profile-empty">No data — test {region} to populate</p>
            </div>
          );
        }

        return (
          <div className="forcelab-profile-region" key={region}>
            <div className="forcelab-profile-region-title">{region}</div>
            {entries.map((entry) => {
              const peak = Math.max(entry.rightPeak ?? 0, entry.leftPeak ?? 0);
              const displayPeak = convertForDisplay(peak, entry.unit, forceUnit);
              const isUnilateral = entry.lsi == null;

              // Unilateral entries (only one side tested, so no LSI) skip the bar entirely
              // — a colored bar/percentage implies a bilateral comparison that was never
              // made, so showing one here would misleadingly read as a real measurement.
              if (isUnilateral) {
                return (
                  <div className="forcelab-profile-bar-row" key={entry.muscleGroup}>
                    <div className="forcelab-profile-bar-label">
                      <span>{entry.muscleGroup}</span>
                      <span className="forcelab-profile-unilateral" style={{ fontWeight: 400 }}>
                        {displayPeak.toFixed(1)} {forceUnit}
                        <em>Unilateral</em>
                      </span>
                    </div>
                  </div>
                );
              }

              const widthPercent = Math.min(100, entry.lsi ?? 0);
              const color = lsiColor(entry.lsi);
              return (
                <div className="forcelab-profile-bar-row" key={entry.muscleGroup}>
                  <div className="forcelab-profile-bar-label">
                    <span>{entry.muscleGroup}</span>
                    <span style={{ color }}>{entry.lsi}%</span>
                  </div>
                  <span className="forcelab-profile-bar-track">
                    <span className="forcelab-profile-bar-fill" style={{ width: `${widthPercent}%`, background: color }} />
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
