"use client";

import Link from "next/link";
import { ArrowLeftIcon, DownloadIcon } from "@/components/icons";

export type ForceLabReportType = "clinical" | "patient";

/** Same fixed-on-screen/hidden-on-print topbar as patient-brief's PatientBriefTopbar.tsx —
 *  reuses the identical .patient-brief-topbar CSS (structurally the same bar, just a
 *  different back link and no Prepare-for-Patient query params to carry). Now also owns the
 *  Clinical/Patient report toggle and, only while the Patient Report is showing, the
 *  Generate/Regenerate Summary button — both hidden on print like the rest of this bar, and
 *  both meaningless outside the print page's own client wrapper (ForceLabAssessmentPrintView),
 *  which is the only caller. */
export function ForceLabAssessmentPrintTopbar({
  reportType,
  onReportTypeChange,
  onGenerateSummary,
  generatingSummary,
  hasSummary,
}: {
  reportType: ForceLabReportType;
  onReportTypeChange: (type: ForceLabReportType) => void;
  onGenerateSummary: () => void;
  generatingSummary: boolean;
  hasSummary: boolean;
}) {
  return (
    <div className="patient-brief-topbar">
      <Link href="/pro/force-lab" className="btn btn-ghost" style={{ color: "#fff" }}>
        <ArrowLeftIcon size={14} />
        Back to Force Lab
      </Link>

      <div className="pbrief-report-toggle">
        <button
          type="button"
          className={`pbrief-report-toggle-btn ${reportType === "clinical" ? "pbrief-report-toggle-btn--active" : ""}`}
          onClick={() => onReportTypeChange("clinical")}
        >
          Clinical Report
        </button>
        <button
          type="button"
          className={`pbrief-report-toggle-btn ${reportType === "patient" ? "pbrief-report-toggle-btn--active" : ""}`}
          onClick={() => onReportTypeChange("patient")}
        >
          Patient Report
        </button>
      </div>

      <div className="pbrief-topbar-actions">
        {reportType === "patient" && (
          <button type="button" className="btn btn-primary" disabled={generatingSummary} onClick={onGenerateSummary}>
            {generatingSummary ? "Writing summary..." : hasSummary ? "Regenerate Summary" : "Generate Patient Summary"}
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          <DownloadIcon size={14} />
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
