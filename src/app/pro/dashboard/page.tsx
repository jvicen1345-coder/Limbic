import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { credentialFromName } from "@/lib/meta";
import { getResearchFeedArticles } from "@/lib/dashboard-research";
import {
  getDashboardSummary,
  getActivePatients,
  getAvailableHEPs,
  getTodaysPatients,
  getPatientsWithOutcomeReminders,
  getEpisodeLengthStats,
  getReferralSourceBreakdown,
} from "@/app/actions/clinician-dashboard";
import { ProGate } from "@/components/pro/ProGate";
import { ClinicianDashboard } from "@/components/pro/dashboard/ClinicianDashboard";

export const metadata: Metadata = {
  title: "Clinician Dashboard",
};

/** The default landing page when a LimbicPRO user enters the PRO section
 *  (/pro/dashboard) — a solo-clinician caseload workspace, built with architecture ready
 *  to extend to a future multi-clinician "Clinic PRO" (see schema.prisma's ClinicalPatient
 *  and friends, all scoped by userId today, none of it patient-identifying — patients are
 *  referenced only by clinician-assigned codes, never a name). This file does the
 *  server-side data gathering; app/components/pro/dashboard/ClinicianDashboard.tsx is the
 *  client orchestrator that owns patient selection and everything downstream of it. */
export default async function ClinicianDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Clinician Dashboard</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          Manage your caseload, generate pre-visit briefs, and track outcomes — all without
          storing a single patient name.
        </p>
        <ProGate toolName="the Clinician Dashboard" />
      </div>
    );
  }

  const [
    summary,
    patients,
    availableHEPs,
    defaultResearch,
    todaysPatients,
    outcomeReminderPatients,
    episodeLengthStats,
    referralBreakdown,
  ] = await Promise.all([
    getDashboardSummary(),
    getActivePatients(),
    getAvailableHEPs(),
    getResearchFeedArticles(user.specialty),
    getTodaysPatients(),
    getPatientsWithOutcomeReminders(),
    getEpisodeLengthStats(),
    getReferralSourceBreakdown(),
  ]);

  if (!summary) return null; // requireProUser inside the actions already matches the isPro check above

  const credential = credentialFromName(user.name);

  return (
    <div className="screen-pad clindash-page page-enter">
      <ClinicianDashboard
        summary={summary}
        initialPatients={patients}
        availableHEPs={availableHEPs}
        defaultResearchArticles={defaultResearch}
        todaysPatients={todaysPatients}
        outcomeReminderPatients={outcomeReminderPatients}
        episodeLengthStats={episodeLengthStats}
        referralBreakdown={referralBreakdown}
        clinicianName={user.name}
        clinicianCredential={credential ?? ""}
        clinicianClinicName={user.clinicName ?? ""}
        clinicianEmail={user.email ?? ""}
      />
    </div>
  );
}
