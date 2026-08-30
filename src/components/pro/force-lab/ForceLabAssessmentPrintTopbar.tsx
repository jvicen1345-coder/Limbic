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
  // Patient Report with no generated summary: the "Your Results at a Glance" section (and
  // the closing recap on the last page) would print empty, so confirm rather than silently
  // handing the clinician a document missing its own headline section — the amber banner
  // above already offers the same Generate Summary action for whoever'd rather fix it first.
  const handlePrintClick = () => {
    if (reportType === "patient" && !hasSummary) {
      const proceed = window.confirm('Print without summary? The "Your Results at a Glance" section will be empty.');
      if (!proceed) return;
    }
    window.print();
  };

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
        <button type="button" className="btn btn-primary" onClick={handlePrintClick}>
          <DownloadIcon size={14} />
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
