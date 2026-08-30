"use client";

import Link from "next/link";
import { ArrowLeftIcon, DownloadIcon } from "@/components/icons";

/** Screen-only chrome for /admin/connexion-safety-score/[id]/print — hidden under
 *  @media print (see .patient-brief-topbar in globals.css, reused here), same pattern as
 *  PatientBriefTopbar. */
export function ConnexionSafetyScorePrintTopbar({ assessmentId }: { assessmentId: string }) {
  return (
    <div className="patient-brief-topbar">
      <Link href={`/admin/connexion-safety-score/${assessmentId}`} className="btn btn-ghost" style={{ color: "#fff" }}>
        <ArrowLeftIcon size={14} />
        Back to Assessment
      </Link>
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        <DownloadIcon size={14} />
        Print / Save as PDF
      </button>
    </div>
  );
}
