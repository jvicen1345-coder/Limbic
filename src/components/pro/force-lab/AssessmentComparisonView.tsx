"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getForceLabAssessment,
  getExistingComparison,
  compareAssessments,
  type ForceLabAssessmentWithSessions,
} from "@/app/actions/force-lab";
import type { ForceLabComparison, ForceLabSession } from "@/generated/prisma/client";

function changeLabel(a: number | null | undefined, b: number | null | undefined): { text: string; className: string } {
  if (a == null || b == null) return { text: "—", className: "forcelab-change--muted" };
  const diff = Math.round((b - a) * 10) / 10;
  if (diff > 0) return { text: `+${diff} lb`, className: "forcelab-change--up" };
  if (diff < 0) return { text: `${diff} lb`, className: "forcelab-change--down" };
  return { text: "—", className: "forcelab-change--muted" };
}

function lsiChangeLabel(a: number | null | undefined, b: number | null | undefined): { text: string; className: string } {
  if (a == null || b == null) return { text: "—", className: "forcelab-change--muted" };
  const diff = Math.round((b - a) * 10) / 10;
  if (diff > 0) return { text: `Improved (+${diff}%)`, className: "forcelab-change--up" };
  if (diff < 0) return { text: `Declined (${diff}%)`, className: "forcelab-change--down" };
  return { text: "Unchanged", className: "forcelab-change--muted" };
}

/** Replaces the two selected rows' expanded views once a clinician has picked two
 *  assessments to compare (see PastResultsSection.tsx) — one row per muscle group that
 *  appears in either assessment, plus the AI Clinical Interpretation card underneath. */
export function AssessmentComparisonView({
  assessmentAId,
  assessmentBId,
  onClear,
}: {
  assessmentAId: string;
  assessmentBId: string;
  onClear: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [assessmentA, setAssessmentA] = useState<ForceLabAssessmentWithSessions | null>(null);
  const [assessmentB, setAssessmentB] = useState<ForceLabAssessmentWithSessions | null>(null);
  const [comparison, setComparison] = useState<ForceLabComparison | null | undefined>(undefined);

  useEffect(() => {
    getForceLabAssessment(assessmentAId).then(setAssessmentA);
    getForceLabAssessment(assessmentBId).then(setAssessmentB);
    getExistingComparison(assessmentAId, assessmentBId).then(setComparison);
  }, [assessmentAId, assessmentBId]);

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await compareAssessments(assessmentAId, assessmentBId);
      if (result.ok) setComparison(result.comparison);
    });
  };

  if (!assessmentA || !assessmentB) {
    return (
      <div className="card elev-sm forcelab-results-section" style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>Loading comparison…</p>
      </div>
    );
  }

  const rows = new Map<string, { a?: ForceLabSession; b?: ForceLabSession }>();
  for (const s of assessmentA.sessions) rows.set(s.muscleGroup, { ...rows.get(s.muscleGroup), a: s });
  for (const s of assessmentB.sessions) rows.set(s.muscleGroup, { ...rows.get(s.muscleGroup), b: s });

  return (
    <div className="card elev-sm forcelab-results-section" style={{ marginTop: 20 }}>
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Comparison — {new Date(assessmentA.assessmentDate).toLocaleDateString()} vs {new Date(assessmentB.assessmentDate).toLocaleDateString()}
        </div>
        <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={onClear}>
          Clear Comparison
        </button>
      </div>

      <div className="forcelab-patient-history-table-wrap">
        <table className="forcelab-patient-history-table">
          <thead>
            <tr>
              <th>Muscle Group</th>
              <th>Left Peak A</th>
              <th>Left Peak B</th>
              <th>Left Change</th>
              <th>Right Peak A</th>
              <th>Right Peak B</th>
              <th>Right Change</th>
              <th>LSI A</th>
              <th>LSI B</th>
              <th>LSI Change</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(rows.entries()).map(([name, { a, b }]) => {
              const leftChange = a && b ? changeLabel(a.leftPeak, b.leftPeak) : { text: "—", className: "forcelab-change--muted" };
              const rightChange = a && b ? changeLabel(a.rightPeak, b.rightPeak) : { text: "—", className: "forcelab-change--muted" };
              const lsi = a && b ? lsiChangeLabel(a.lsi, b.lsi) : { text: "—", className: "forcelab-change--muted" };
              return (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{a ? (a.leftPeak ?? "—") : "Not tested"}</td>
                  <td>{b ? (b.leftPeak ?? "—") : "Not tested"}</td>
                  <td className={leftChange.className}>{leftChange.text}</td>
                  <td>{a ? (a.rightPeak ?? "—") : "Not tested"}</td>
                  <td>{b ? (b.rightPeak ?? "—") : "Not tested"}</td>
                  <td className={rightChange.className}>{rightChange.text}</td>
                  <td>{a ? (a.lsi != null ? `${a.lsi}%` : "—") : "Not tested"}</td>
                  <td>{b ? (b.lsi != null ? `${b.lsi}%` : "—") : "Not tested"}</td>
                  <td className={lsi.className}>{lsi.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="forcelab-ai-card">
        <div className="forcelab-ai-card-header">
          <span className="card-kicker" style={{ margin: 0 }}>
            Clinical Interpretation
          </span>
          <span className="forcelab-ai-generated-label">Generated by Limbic Agent</span>
        </div>

        {comparison === undefined ? (
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>Loading…</p>
        ) : comparison?.interpretation ? (
          <>
            <p className="forcelab-ai-text">{comparison.interpretation}</p>
            <p className="forcelab-ai-disclaimer">This is a clinical reasoning aid. Apply your own clinical judgment.</p>
            <div className="clindash-inline-form-actions">
              {assessmentA.patientId && (
                <Link href={`/pro/patient-brief/${assessmentA.patientId}`} className="btn btn-secondary">
                  Add to Patient Brief
                </Link>
              )}
              <button type="button" className="btn btn-secondary" disabled={pending} onClick={handleGenerate}>
                {pending ? "Regenerating…" : "Regenerate"}
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={handleGenerate}>
            {pending ? "Generating…" : "Generate Interpretation"}
          </button>
        )}
      </div>
    </div>
  );
}
