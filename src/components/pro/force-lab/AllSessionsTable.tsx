"use client";

import Link from "next/link";
import { useState } from "react";
import { bodyRegions } from "@/lib/force-lab-muscles";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { ForceLabSession } from "@/generated/prisma/client";

function lsiColor(lsi: number): string {
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Full session list on /pro/force-lab/sessions — the "View All Sessions" destination from
 *  the main tool's compact Recent Sessions card (see ForceLabWorkspace.tsx), which now only
 *  shows the single most recent session inline. Same region/patient filters the old
 *  always-expanded session list had, laid out as a table (this page has the room a
 *  240px-wide column never did) instead of a scrolling stack of cards. "View" links into
 *  the main tool pre-loaded to that exact session, same as PatientSessionHistoryTable. */
export function AllSessionsTable({ sessions, forceUnit }: { sessions: ForceLabSession[]; forceUnit: string }) {
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
    <>
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
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 14 }}>No sessions match these filters.</p>
      ) : (
        <div className="forcelab-patient-history-table-wrap">
          <table className="forcelab-patient-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Muscle Group</th>
                <th>Patient</th>
                <th>Right Peak</th>
                <th>Left Peak</th>
                <th>LSI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const right = s.rightPeak != null ? convertForDisplay(s.rightPeak, s.unit, forceUnit) : null;
                const left = s.leftPeak != null ? convertForDisplay(s.leftPeak, s.unit, forceUnit) : null;
                return (
                  <tr key={s.id}>
                    <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                    <td>{s.muscleGroup}</td>
                    <td>{s.patientCode ?? "—"}</td>
                    <td>{right != null ? `${right} ${forceUnit}` : "—"}</td>
                    <td>{left != null ? `${left} ${forceUnit}` : "—"}</td>
                    <td style={{ color: s.lsi != null ? lsiColor(s.lsi) : undefined, fontWeight: 700 }}>
                      {s.lsi != null ? `${s.lsi}%` : "—"}
                    </td>
                    <td>
                      <Link href={`/pro/force-lab?session=${s.id}`} className="clindash-seats-add-link">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
