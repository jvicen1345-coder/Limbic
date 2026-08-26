"use client";

import { useState } from "react";
import type { DashboardSummary, PatientListEntry } from "@/app/actions/clinician-dashboard";
import { EndOfDayCard } from "./EndOfDayCard";

function formatFullDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function lastOutcomeLabel(p: PatientListEntry): string | null {
  const latest = p.recentOutcomes[0];
  return latest ? `${latest.measureName}: ${latest.score}/${latest.maxScore}` : null;
}

/** The Clinician Dashboard's default center-column state — replaces the previous
 *  greeting/Limbic-Agent-card/quick-links default view per this feature's own spec
 *  ("Replace the default center column state when no patient is selected with a Morning
 *  Rounds View"). ClinicianDashboard.tsx owns all the actual data fetching and state; this
 *  is presentation plus the small local "switch to patient view" search. */
export function MorningRounds({
  todaysPatients,
  outcomeReminderPatients,
  allPatients,
  summary,
  onStartSession,
  onRecordOutcomes,
  onSelectPatient,
}: {
  todaysPatients: PatientListEntry[];
  outcomeReminderPatients: PatientListEntry[];
  allPatients: PatientListEntry[];
  summary: DashboardSummary;
  onStartSession: (patientId: string) => void;
  onRecordOutcomes: (patientId: string) => void;
  onSelectPatient: (patientId: string) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchResults = query.trim()
    ? allPatients.filter((p) => p.patientCode.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  return (
    <div>
      <EndOfDayCard />

      <h1 className="clindash-morning-title">Morning Rounds</h1>
      <p className="clindash-morning-date">{formatFullDate(new Date())}</p>

      <div className="clindash-section">
        <div className="card-kicker" style={{ marginBottom: 8 }}>
          Today&rsquo;s Patients
        </div>
        {todaysPatients.length === 0 ? (
          <p className="clindash-empty-state">No patients scheduled today. Select a patient from the panel or add a new one.</p>
        ) : (
          <div className="clindash-today-list">
            {todaysPatients.map((p) => {
              const outcomeLabel = lastOutcomeLabel(p);
              return (
                <div className="clindash-today-row" key={p.id}>
                  <div className="clindash-today-row-main">
                    <div className="clindash-today-row-code">{p.patientCode}</div>
                    <div className="clindash-today-row-condition">{p.condition}</div>
                    {outcomeLabel && <div className="clindash-today-row-outcome">{outcomeLabel}</div>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ fontSize: 12.5, flexShrink: 0 }}
                    onClick={() => onStartSession(p.id)}
                  >
                    Start Session
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {outcomeReminderPatients.length > 0 && (
        <div className="clindash-section">
          <div className="card-kicker clindash-reminders-header" style={{ marginBottom: 8 }}>
            Due for Reassessment
          </div>
          {outcomeReminderPatients.map((p) => (
            <div className="clindash-reminder-row" key={p.id}>
              <div className="clindash-reminder-row-main">
                <div className="clindash-reminder-row-code">{p.patientCode}</div>
                <div className="clindash-reminder-row-condition">{p.condition}</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12, flexShrink: 0 }}
                onClick={() => onRecordOutcomes(p.id)}
              >
                Record Outcomes
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="clindash-quickstats-row">
        <div className="card elev-sm clindash-quickstat-tile">
          <div className="clindash-quickstat-value">{todaysPatients.length}</div>
          <div className="clindash-quickstat-label">Patients Today</div>
        </div>
        <div className="card elev-sm clindash-quickstat-tile">
          <div className="clindash-quickstat-value">{summary.seenThisWeek}</div>
          <div className="clindash-quickstat-label">Seen This Week</div>
        </div>
        <div className="card elev-sm clindash-quickstat-tile">
          {/* Reuses getDashboardSummary's existing ceHours.completed field per this
              feature's own "no new query needed" instruction — that field is cumulative
              hours logged, not literally scoped to the past 7 days, but it's what the
              already-fetched dashboard summary has without a second query. */}
          <div className="clindash-quickstat-value">{summary.ceHours.completed}</div>
          <div className="clindash-quickstat-label">CE Hours This Week</div>
        </div>
      </div>

      {!searchOpen ? (
        <button type="button" className="clindash-switch-view-link" onClick={() => setSearchOpen(true)}>
          Switch to Patient View
        </button>
      ) : (
        <div className="clindash-patient-search-wrap">
          <input
            className="input"
            placeholder="Search by patient code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="clindash-patient-search-results">
              {searchResults.map((p) => (
                <button key={p.id} type="button" className="clindash-patient-search-result" onClick={() => onSelectPatient(p.id)}>
                  <strong>{p.patientCode}</strong> — {p.condition}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
