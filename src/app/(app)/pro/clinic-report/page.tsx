import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getClinicReports } from "@/app/actions/clinic-pro";
import { ClinicReportView } from "@/components/pro/dashboard/ClinicReportView";

export const metadata: Metadata = {
  title: "Clinic Outcome Report",
};

/** Authenticated, clinic admin only — lives in the (app) route group for the AppShell
 *  sidebar. "Download Report" (see ClinicReportView) uses window.print() with
 *  .clindash-report-no-print hiding the form/history around it, plus the global
 *  @media print rule in globals.css that hides the sidebar/topbar chrome itself (see that
 *  rule's own comment) — same print-styles goal as the patient brief print page
 *  (app/pro/patient-brief/[patientId]), which stays standalone since it's meant to be
 *  printed with zero app chrome at all, not just this report's own form/history hidden. */
export default async function ClinicReportPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const clinic = await prisma.clinic.findUnique({ where: { adminUserId: user.id } });
  if (!clinic) {
    return (
      <div className="clindash-standalone-page">
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
          This page is only available to Clinic PRO admins.
        </p>
      </div>
    );
  }

  const history = await getClinicReports();

  return (
    <div className="clindash-standalone-page clindash-standalone-page--wide">
      <h1 className="clindash-standalone-title">Clinic Outcome Report</h1>
      <p className="clindash-standalone-subtitle">Aggregate outcomes across your practice. No patient identifiers included.</p>
      <ClinicReportView initialHistory={history} />
    </div>
  );
}
