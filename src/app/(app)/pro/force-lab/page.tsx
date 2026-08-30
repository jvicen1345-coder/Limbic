import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { getActivePatients } from "@/app/actions/clinician-dashboard";
import { getForceLabSessions, getUserForceUnit } from "@/app/actions/force-lab";
import { ProGate } from "@/components/pro/ProGate";
import { ForceLabWorkspace } from "@/components/pro/force-lab/ForceLabWorkspace";

export const metadata: Metadata = {
  title: "Force Lab",
};

/** Limbic Force Lab (/pro/force-lab) — a dedicated handheld-dynamometer data tool,
 *  connected to (but not nested inside) the LimbicPRO Clinician Dashboard's patient
 *  records: ForceLabSession links to ClinicalPatient by id, the dashboard's active-patient
 *  workspace shows a Force Lab summary, and the patient brief print document gets a
 *  Strength Measurements section — but this page itself is its own standalone tool. Lives
 *  in the (app) route group (moved here from a standalone src/app/pro/force-lab so the
 *  AppShell sidebar shows up here too — the sidebar's own "Force Lab" link would otherwise
 *  drop the reader into a page with no way back).
 *
 *  `?patient=<id>` pre-selects a patient in the entry form and the strength-profile column
 *  — see the "Add Session" links from the dashboard's Force Lab section and the patient
 *  session page's "New Session" button. `?compareAssessment=<id>` arms the Past Results
 *  section's comparison with that assessment pre-selected — see the "Compare" button on the
 *  patient session page's Full Assessments cards, which can't build the whole comparison UI
 *  itself since it lives on a different route. */
export default async function ForceLabPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; session?: string; compareAssessment?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Force Lab</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          Import and analyze handheld dynamometer data. Track patient strength over time. Available with LimbicPRO
          — $15/month.
        </p>
        <ProGate toolName="Force Lab" />
      </div>
    );
  }

  const { patient, session, compareAssessment } = await searchParams;

  const [patients, sessions, forceUnit] = await Promise.all([getActivePatients(), getForceLabSessions(), getUserForceUnit()]);

  return (
    <div className="screen-pad forcelab-page page-enter">
      <ForceLabWorkspace
        initialSessions={sessions}
        patients={patients}
        forceUnit={forceUnit}
        initialPatientId={patient ?? null}
        initialSessionId={session ?? null}
        initialCompareAssessmentId={compareAssessment ?? null}
      />
    </div>
  );
}
