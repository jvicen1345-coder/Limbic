"use client";

import Link from "next/link";
import { ArrowLeftIcon, DownloadIcon } from "@/components/icons";

/** Screen-only chrome for /pro/patient-brief/[patientId] — hidden entirely under
 *  @media print (see .patient-brief-topbar in globals.css), so it never shows up in the
 *  printed or saved-as-PDF document itself. */
export function PatientBriefTopbar() {
  return (
    <div className="patient-brief-topbar">
      <Link href="/pro/dashboard" className="btn btn-ghost" style={{ color: "#fff" }}>
        <ArrowLeftIcon size={14} />
        Back to Dashboard
      </Link>
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        <DownloadIcon size={14} />
        Print / Save as PDF
      </button>
    </div>
  );
}
