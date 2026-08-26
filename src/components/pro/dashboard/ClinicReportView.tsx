"use client";

import { useState, useTransition } from "react";
import {
  generateClinicReport,
  getClinicReportById,
  getClinicReports,
  type ClinicReport,
  type ClinicReportSummary,
} from "@/app/actions/clinic-pro";

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString();
}

/** /pro/clinic-report's whole interactive surface — form, the generated report itself, and
 *  Report History — one client component since "View" on a history row needs to swap the
 *  currently-displayed report without a page navigation (there's no per-report URL, just
 *  client state — see handleView below). `initialHistory` is server-fetched so the history
 *  list is there on first paint; every mutation refreshes it from the same getClinicReports
 *  call rather than optimistically splicing in a local copy. */
export function ClinicReportView({ initialHistory }: { initialHistory: ClinicReportSummary[] }) {
  const [pending, startTransition] = useTransition();
  const [history, setHistory] = useState(initialHistory);
  const [report, setReport] = useState<ClinicReport | null>(null);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    if (!rangeStart || !rangeEnd) {
      setError("Choose both a start and end date.");
      return;
    }
    startTransition(async () => {
      const result = await generateClinicReport(rangeStart, rangeEnd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReport(result.report);
      const fresh = await getClinicReports();
      setHistory(fresh);
    });
  };

  const handleView = (id: string) => {
    startTransition(async () => {
      const found = await getClinicReportById(id);
      if (found) setReport(found);
    });
  };

  return (
    <>
      <div className="card elev-sm clindash-report-no-print">
        <div className="clindash-inline-form-row">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="report-start">Date range start</label>
            <input className="input" id="report-start" type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="report-end">Date range end</label>
            <input className="input" id="report-end" type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
          </div>
        </div>
        {error && <p style={{ fontSize: 12.5, color: "var(--color-danger)", margin: "10px 0 0" }}>{error}</p>}
        <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} disabled={pending} onClick={handleGenerate}>
          {pending ? "Generating…" : "Generate Report"}
        </button>
      </div>

      {report && (
        <div className="card elev-sm" style={{ marginTop: 20 }}>
          <div className="clindash-section-header clindash-report-no-print">
            <div className="card-kicker" style={{ margin: 0 }}>
              {fmtDate(report.dateRangeStart)} – {fmtDate(report.dateRangeEnd)}
            </div>
            <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => window.print()}>
              Download Report
            </button>
          </div>

          <div className="clindash-report-section">
            <div className="clindash-report-section-title">Practice Overview</div>
            <div className="clindash-report-stat-row">
              <div className="card clindash-report-stat-card">
                <div className="clindash-report-stat-value">{report.reportData.practiceOverview.totalPatients}</div>
                <div className="clindash-report-stat-label">Total patients in range</div>
              </div>
              <div className="card clindash-report-stat-card">
                <div className="clindash-report-stat-value">{report.reportData.practiceOverview.totalVisits}</div>
                <div className="clindash-report-stat-label">Total visits completed</div>
              </div>
              <div className="card clindash-report-stat-card">
                <div className="clindash-report-stat-value">{report.reportData.practiceOverview.newPatients}</div>
                <div className="clindash-report-stat-label">New patients</div>
              </div>
              <div className="card clindash-report-stat-card">
                <div className="clindash-report-stat-value">{report.reportData.practiceOverview.returningPatients}</div>
                <div className="clindash-report-stat-label">Returning patients</div>
              </div>
            </div>
            {report.reportData.practiceOverview.episodeLengthByRegion.length > 0 && (
              <table className="clindash-region-stat-table">
                <tbody>
                  {report.reportData.practiceOverview.episodeLengthByRegion.map((r) => (
                    <tr key={r.bodyRegion}>
                      <td>{r.bodyRegion}</td>
                      <td style={{ textAlign: "right" }}>{r.averageVisits.toFixed(1)} avg visits</td>
                      <td style={{ textAlign: "right" }}>{r.patientCount} patients</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="clindash-report-section">
            <div className="clindash-report-section-title">Outcome Measure Trends</div>
            {report.reportData.outcomeMeasureTrends.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>
                No measure had 2 or more patients with repeated scores in this date range.
              </p>
            ) : (
              <div className="clindash-benchmark-cards">
                {report.reportData.outcomeMeasureTrends.map((t) => (
                  <div className="card" key={t.measureName}>
                    <div className="clindash-benchmark-card-measure">{t.measureName}</div>
                    <div className="clindash-benchmark-card-stat">
                      {t.averageImprovement > 0 ? "+" : ""}
                      {t.averageImprovement.toFixed(1)} avg improvement · {t.patientCount} patients
                    </div>
                    <div className="clindash-benchmark-card-stat">MCID: {t.benchmark.mcid}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="clindash-report-section">
            <div className="clindash-report-section-title">Referral Sources</div>
            {report.reportData.referralSources.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No referral sources recorded in this date range.</p>
            ) : (
              <div className="clindash-region-bars">
                {report.reportData.referralSources.map((r) => (
                  <div className="clindash-region-bar-row" key={r.source}>
                    <span className="clindash-region-bar-label">{r.source}</span>
                    <span className="clindash-region-bar-track">
                      <span
                        className="clindash-region-bar-fill"
                        style={{ width: `${(r.count / Math.max(1, ...report.reportData.referralSources.map((x) => x.count))) * 100}%` }}
                      />
                    </span>
                    <span className="clindash-region-bar-count">{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="clindash-report-section">
            <div className="clindash-report-section-title">CE Compliance</div>
            <table className="clindash-region-stat-table">
              <tbody>
                {report.reportData.ceCompliance.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td style={{ textAlign: "right" }}>
                      {c.hoursCompleted} of {c.hoursRequired} hrs
                    </td>
                    <td style={{ textAlign: "right", color: c.onTrack ? "var(--color-success)" : "#c9853a", fontWeight: 600 }}>
                      {c.onTrack ? "On track" : "Behind"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card elev-sm clindash-report-no-print" style={{ marginTop: 20 }}>
        <div className="card-kicker">Report History</div>
        {history.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: 8 }}>No reports generated yet.</p>
        ) : (
          history.map((h) => (
            <div className="clindash-report-history-row" key={h.id}>
              <span>
                {fmtDate(h.dateRangeStart)} – {fmtDate(h.dateRangeEnd)}{" "}
                <span style={{ color: "var(--color-neutral-700)" }}>· generated {fmtDate(h.generatedAt)}</span>
              </span>
              <button type="button" className="clindash-seats-add-link" disabled={pending} onClick={() => handleView(h.id)}>
                View
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
