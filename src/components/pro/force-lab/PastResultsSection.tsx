"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import {
  getForceLabAssessments,
  getForceLabAssessment,
  deleteForceLabAssessment,
  type ForceLabAssessmentSummary,
  type ForceLabAssessmentWithSessions,
} from "@/app/actions/force-lab";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import { AssessmentExpandedView } from "./AssessmentExpandedView";
import { AssessmentComparisonView } from "./AssessmentComparisonView";

/** Full-width section below the three-column Force Lab layout — self-fetching, lists every
 *  full assessment this clinician has imported (across every patient, hence the Patient
 *  column — same "global, filterable" shape as the left column's Session History, not
 *  scoped to whichever patient happens to be selected above it). */
export function PastResultsSection({
  patients,
  initialCompareAssessmentId,
  refreshKey,
}: {
  patients: PatientListEntry[];
  initialCompareAssessmentId?: string | null;
  /** Bumped by ForceLabWorkspace.tsx whenever the sibling Paste Assessment tab saves a new
   *  assessment — this section owns its own self-fetched list, so it has no other way to
   *  learn about a save that happened outside its own delete/link handlers. */
  refreshKey?: number;
}) {
  const [pending, startTransition] = useTransition();
  const [assessments, setAssessments] = useState<ForceLabAssessmentSummary[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<ForceLabAssessmentWithSessions | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(initialCompareAssessmentId ? [initialCompareAssessmentId] : []);
  const [showCompareHint, setShowCompareHint] = useState(!!initialCompareAssessmentId);

  const refresh = () => {
    getForceLabAssessments().then(setAssessments);
  };

  useEffect(() => {
    refresh();
  }, [refreshKey]);

  useEffect(() => {
    if (initialCompareAssessmentId) {
      document.getElementById("forcelab-past-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Mount-only — initialCompareAssessmentId is only meant to matter for the render this
    // component was created with, same reasoning as OutcomeMeasuresSection's initiallyOpen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetail(null);
      return;
    }
    setExpandedId(id);
    setExpandedDetail(null);
    getForceLabAssessment(id).then(setExpandedDetail);
  };

  const handleCompareClick = (id: string) => {
    setShowCompareHint(false);
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setExpandedId(null);
    setExpandedDetail(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this assessment and all its muscle group data? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteForceLabAssessment(id);
      if (!result.ok) return;
      setAssessments((prev) => prev?.filter((a) => a.id !== id) ?? null);
      setCompareIds((prev) => prev.filter((x) => x !== id));
      if (expandedId === id) {
        setExpandedId(null);
        setExpandedDetail(null);
      }
    });
  };

  const handleLinked = () => {
    refresh();
    if (expandedId) getForceLabAssessment(expandedId).then(setExpandedDetail);
  };

  if (compareIds.length === 2) {
    return <AssessmentComparisonView assessmentAId={compareIds[0]} assessmentBId={compareIds[1]} onClear={() => setCompareIds([])} />;
  }

  return (
    <div className="card elev-sm forcelab-results-section" id="forcelab-past-results" style={{ marginTop: 20 }}>
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Past Results
        </div>
        <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowCompareHint(true)}>
          Compare Two Assessments
        </button>
      </div>

      {(showCompareHint || compareIds.length === 1) && (
        <p className="forcelab-compare-hint">
          {compareIds.length === 1 ? "Select a second assessment below to compare." : "Click Compare on two assessments below."}
        </p>
      )}

      {!assessments ? null : assessments.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No full assessments imported yet — use the Paste Assessment tab above.</p>
      ) : (
        <div className="forcelab-patient-history-table-wrap">
          <table className="forcelab-patient-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Identifier</th>
                <th>Patient</th>
                <th>Muscles Tested</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => {
                const selected = compareIds.includes(a.id);
                return (
                  <Fragment key={a.id}>
                    <tr className={selected ? "forcelab-results-row--selected" : undefined}>
                      <td>{new Date(a.assessmentDate).toLocaleDateString()}</td>
                      <td>{a.identifier ?? "—"}</td>
                      <td>{a.patientCode ?? "Unlinked"}</td>
                      <td>{a.musclesTested}</td>
                      <td>Paste Import</td>
                      <td className="forcelab-results-actions">
                        <button type="button" className="btn btn-ghost" style={{ fontSize: 11.5 }} onClick={() => handleToggleExpand(a.id)}>
                          View
                        </button>
                        <button type="button" className="btn btn-ghost" style={{ fontSize: 11.5 }} onClick={() => handleCompareClick(a.id)}>
                          {selected ? "Selected" : compareIds.length === 1 ? "Compare With This" : "Compare"}
                        </button>
                        <button
                          type="button"
                          className="clindash-question-delete"
                          onClick={() => handleDelete(a.id)}
                          disabled={pending}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedId === a.id && (
                      <tr>
                        <td colSpan={6}>
                          {!expandedDetail ? (
                            <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>Loading…</p>
                          ) : (
                            <AssessmentExpandedView assessment={expandedDetail} patients={patients} onLinked={handleLinked} />
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
