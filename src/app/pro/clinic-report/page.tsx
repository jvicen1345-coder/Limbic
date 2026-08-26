import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getClinicReports } from "@/app/actions/clinic-pro";
import { ClinicReportView } from "@/components/pro/dashboard/ClinicReportView";

export const metadata: Metadata = {
  title: "Clinic Outcome Report",
};

/** Authenticated, clinic admin only — same "outside the (app) route group, no AppShell"
 *  shell as its sibling Clinic PRO pages. "Download Report" (see ClinicReportView) uses
 *  window.print() with .clindash-report-no-print hiding the form/history around it, same
 *  print-styles pattern as the patient brief print page (app/pro/patient-brief/[patientId]). */
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
