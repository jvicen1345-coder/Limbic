import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getForceLabSessionsByPatientCode, getStrengthProfile, getUserForceUnit } from "@/app/actions/force-lab";
import { ProGate } from "@/components/pro/ProGate";
import { StrengthProfilePanel } from "@/components/pro/force-lab/StrengthProfilePanel";
import { PatientSessionHistoryTable } from "@/components/pro/force-lab/PatientSessionHistoryTable";

export async function generateMetadata({ params }: { params: Promise<{ patientCode: string }> }): Promise<Metadata> {
  const { patientCode } = await params;
  return { title: `Force Lab — ${decodeURIComponent(patientCode)}` };
}

/** One patient's full Force Lab history — reached from the dashboard's Force Lab section
 *  ("View all in Force Lab") and from a session's own patient-code pill. Same (app) route
 *  group placement as /pro/force-lab itself, for the sidebar. */
export default async function ForceLabPatientPage({ params }: { params: Promise<{ patientCode: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Force Lab</h1>
        <ProGate toolName="Force Lab" />
      </div>
    );
  }

  const { patientCode: rawPatientCode } = await params;
  const patientCode = decodeURIComponent(rawPatientCode);

  const patient = await prisma.clinicalPatient.findUnique({ where: { userId_patientCode: { userId: user.id, patientCode } } });

  const [sessions, forceUnit, strengthProfile] = await Promise.all([
    getForceLabSessionsByPatientCode(patientCode),
    getUserForceUnit(),
    patient ? getStrengthProfile(patient.id) : Promise.resolve([]),
  ]);

  return (
    <div className="screen-pad forcelab-page page-enter">
      <div className="forcelab-header-row">
        <div>
          <Link href="/pro/force-lab" className="clindash-seats-add-link" style={{ display: "inline-block", marginBottom: 6 }}>
            ← Back to Force Lab
          </Link>
          <h1 className="forcelab-title">Force Lab — {patientCode}</h1>
        </div>
        <Link href={`/pro/force-lab${patient ? `?patient=${patient.id}` : ""}`} className="btn btn-primary">
          New Session
        </Link>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 20 }}>
        <div className="card-kicker">Strength Profile</div>
        <StrengthProfilePanel profile={strengthProfile} forceUnit={forceUnit} layout="full" />
      </div>

      <div className="card elev-sm">
        <div className="card-kicker">Session History</div>
        <PatientSessionHistoryTable sessions={sessions} forceUnit={forceUnit} />
      </div>
    </div>
  );
}
