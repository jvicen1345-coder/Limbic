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
 *  Strength Measurements section — but this page itself is its own standalone tool, same
 *  "outside the (app) route group, no AppShell sidebar" shell as /pro/dashboard (see that
 *  page's own comment) for internal consistency across every /pro/* tool page that isn't a
 *  simple reference lookup.
 *
 *  `?patient=<id>` pre-selects a patient in the entry form and the strength-profile column
 *  — see the "Add Session" links from the dashboard's Force Lab section and the patient
 *  session page's "New Session" button. */
export default async function ForceLabPage({ searchParams }: { searchParams: Promise<{ patient?: string; session?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Force Lab</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          Handheld dynamometer data — powered by ActiveForce.
        </p>
        <ProGate toolName="Force Lab" />
      </div>
    );
  }

  const { patient, session } = await searchParams;

  const [patients, sessions, forceUnit] = await Promise.all([getActivePatients(), getForceLabSessions(), getUserForceUnit()]);

  return (
    <div className="screen-pad forcelab-page page-enter">
      <ForceLabWorkspace
        initialSessions={sessions}
        patients={patients}
        forceUnit={forceUnit}
        initialPatientId={patient ?? null}
        initialSessionId={session ?? null}
      />
    </div>
  );
}
