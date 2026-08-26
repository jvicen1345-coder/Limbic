import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getForceLabSessionsByPatientCode, getStrengthProfile, getUserForceUnit, getAssessmentHistory } from "@/app/actions/force-lab";
import { ProGate } from "@/components/pro/ProGate";
import { StrengthProfilePanel } from "@/components/pro/force-lab/StrengthProfilePanel";
import { PatientSessionHistoryTable } from "@/components/pro/force-lab/PatientSessionHistoryTable";
import { PatientAssessmentCard } from "@/components/pro/force-lab/PatientAssessmentCard";
import { ForceLabAssessmentTrendChart, type AssessmentTrendPoint } from "@/components/pro/force-lab/ForceLabAssessmentTrendChart";

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

  const [sessions, forceUnit, strengthProfile, assessments] = await Promise.all([
    getForceLabSessionsByPatientCode(patientCode),
    getUserForceUnit(),
    patient ? getStrengthProfile(patient.id) : Promise.resolve([]),
    patient ? getAssessmentHistory(patient.id) : Promise.resolve([]),
  ]);

  // Trend visualization — every muscle group ever tested gets a slot; `assessments` is
  // oldest-first (see getAssessmentHistory), so pushing in iteration order keeps each
  // muscle group's own points chronological without a separate sort. A muscle group with
  // only one assessment still gets a card here — ForceLabAssessmentTrendChart itself shows
  // a muted "add a second assessment" message instead of an empty chart frame rather than
  // silently vanishing from the section.
  const trendsByMuscle = new Map<string, AssessmentTrendPoint[]>();
  for (const a of assessments) {
    for (const s of a.sessions) {
      const points = trendsByMuscle.get(s.muscleGroup) ?? [];
      points.push({ date: a.assessmentDate, leftPeak: s.leftPeak, rightPeak: s.rightPeak, lsi: s.lsi });
      trendsByMuscle.set(s.muscleGroup, points);
    }
  }
  const trendEntries = Array.from(trendsByMuscle.entries());

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

      <div className="card elev-sm" style={{ marginBottom: 20 }}>
        <div className="card-kicker">Full Assessments</div>
        {assessments.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: 8 }}>
            No full assessments imported for this patient yet — use the Paste Assessment tab on Force Lab.
          </p>
        ) : (
          <div className="forcelab-assessment-summary-list">
            {assessments
              .slice()
              .reverse()
              .map((a) => (
                <PatientAssessmentCard key={a.id} assessment={a} />
              ))}
          </div>
        )}
      </div>

      <div className="card elev-sm">
        <div className="card-kicker">Session History</div>
        <PatientSessionHistoryTable sessions={sessions} forceUnit={forceUnit} />
      </div>

      {trendEntries.length > 0 && (
        <div className="forcelab-assessment-trends-section">
          <div className="card-kicker" style={{ margin: "20px 0 10px" }}>
            Trends Across Assessments
          </div>
          <div className="forcelab-assessment-trends-grid">
            {trendEntries.map(([muscleGroup, points]) => (
              <ForceLabAssessmentTrendChart key={muscleGroup} muscleGroup={muscleGroup} points={points} unitLabel={forceUnit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
