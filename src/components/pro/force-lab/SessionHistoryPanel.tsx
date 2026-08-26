"use client";

import { useState } from "react";
import { bodyRegions } from "@/lib/force-lab-muscles";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { ForceLabSession } from "@/generated/prisma/client";

function lsiPillColor(lsi: number): string {
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Left column — every session for this clinician, filterable by body region and by which
 *  patient (if any) it's linked to. The patient filter's options come from the sessions
 *  themselves (distinct patientCode values already present), not the full active-patient
 *  list — a patient with no Force Lab sessions yet has nothing to filter by. */
export function SessionHistoryPanel({
  sessions,
  forceUnit,
  selectedSessionId,
  onSelect,
}: {
  sessions: ForceLabSession[];
  forceUnit: string;
  selectedSessionId: string | null;
  onSelect: (sessionId: string) => void;
}) {
  const [regionFilter, setRegionFilter] = useState("All");
  const [patientFilter, setPatientFilter] = useState("All");

  const patientCodes = Array.from(new Set(sessions.map((s) => s.patientCode).filter((c): c is string => !!c))).sort();

  const filtered = sessions.filter((s) => {
    if (regionFilter !== "All" && s.bodyRegion !== regionFilter) return false;
    if (patientFilter === "Unlinked" && s.patientCode) return false;
    if (patientFilter !== "All" && patientFilter !== "Unlinked" && s.patientCode !== patientFilter) return false;
    return true;
  });

  return (
    <div className="forcelab-history-panel">
      <div className="card-kicker">Recent Sessions</div>

      <div className="forcelab-filter-row">
        <select className="input" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="All">All Regions</option>
          {bodyRegions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select className="input" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)}>
          <option value="All">All Patients</option>
          <option value="Unlinked">Unlinked</option>
          {patientCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="forcelab-history-empty">No sessions recorded. Add your first session above.</p>
      ) : (
        <div className="forcelab-history-list">
          {filtered.map((s) => {
            const right = s.rightPeak != null ? convertForDisplay(s.rightPeak, s.unit, forceUnit) : null;
            const left = s.leftPeak != null ? convertForDisplay(s.leftPeak, s.unit, forceUnit) : null;
            return (
              <button
                type="button"
                key={s.id}
                className={`forcelab-history-card ${selectedSessionId === s.id ? "forcelab-history-card--active" : ""}`}
                onClick={() => onSelect(s.id)}
              >
                <div className="forcelab-history-card-muscle">{s.muscleGroup}</div>
                <div className="forcelab-history-card-date">{new Date(s.sessionDate).toLocaleDateString()}</div>
                <div className="forcelab-history-card-peaks">
                  <span>R: {right != null ? `${right} ${forceUnit}` : "—"}</span>
                  <span>L: {left != null ? `${left} ${forceUnit}` : "—"}</span>
                </div>
                <div className="forcelab-history-card-tags">
                  {s.lsi != null && (
                    <span className="forcelab-lsi-pill" style={{ color: lsiPillColor(s.lsi), borderColor: lsiPillColor(s.lsi) }}>
                      LSI {s.lsi}%
                    </span>
                  )}
                  {s.patientCode && <span className="tag">{s.patientCode}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
