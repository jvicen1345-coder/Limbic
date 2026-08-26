"use client";

import Link from "next/link";
import { ArrowLeftIcon, DownloadIcon } from "@/components/icons";

/** Same fixed-on-screen/hidden-on-print topbar as patient-brief's PatientBriefTopbar.tsx —
 *  reuses the identical .patient-brief-topbar CSS (structurally the same bar, just a
 *  different back link and no Prepare-for-Patient query params to carry). */
export function ForceLabAssessmentPrintTopbar() {
  return (
    <div className="patient-brief-topbar">
      <Link href="/pro/force-lab" className="btn btn-ghost" style={{ color: "#fff" }}>
        <ArrowLeftIcon size={14} />
        Back to Force Lab
      </Link>
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        <DownloadIcon size={14} />
        Print / Save as PDF
      </button>
    </div>
  );
}
