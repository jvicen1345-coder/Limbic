import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PatientBriefTopbar } from "@/components/pro/dashboard/PatientBriefTopbar";

interface HEPExercise {
  name: string;
  sets?: string | number;
  reps?: string | number;
  notes?: string;
}

function isExerciseArray(value: unknown): value is HEPExercise[] {
  return Array.isArray(value) && value.every((v) => v && typeof v === "object" && typeof (v as { name?: unknown }).name === "string");
}

/** The printable patient document — always light mode regardless of the clinician's own
 *  theme preference (see globals.css's .patient-brief-* rules, which use literal colors
 *  rather than the app's --color-* custom properties for exactly this reason: a document
 *  meant to be printed or saved as a PDF should look the same on paper no matter what
 *  theme the clinician happens to be browsing in). Never renders a patient name — the
 *  only patient-identifying field anywhere on this page is the clinician-assigned
 *  patientCode, same as everywhere else in the Clinician Dashboard. Clinician display
 *  fields (name/credential/clinicName/email) come from the "Prepare for Patient" modal's
 *  Step 3 via URL search params, since this is a fresh navigation in a new tab with no
 *  shared client state — falling back to the clinician's live profile values when a param
 *  is missing (e.g. a direct navigation to this URL). */
export default async function PatientBriefPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ name?: string; credential?: string; clinicName?: string; email?: string; includeHep?: string }>;
}) {
  const { patientId } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();
  if (!user || !user.isPro) notFound();

  const patient = await prisma.clinicalPatient.findUnique({
    where: { id: patientId },
    include: {
      hepAssignments: { orderBy: { assignedAt: "desc" }, take: 1 },
      preBriefs: { where: { patientFacing: true }, orderBy: { generatedAt: "desc" }, take: 1 },
    },
  });
  if (!patient || patient.userId !== user.id) notFound();

  const clinicianName = query.name || user.name;
  const clinicianCredential = query.credential ?? "";
  const clinicianClinicName = query.clinicName || user.clinicName || "";
  const clinicianEmail = query.email || user.email;
  const includeHep = query.includeHep !== "0";

  const summary = patient.preBriefs[0]?.brief ?? null;
  const hep = includeHep ? patient.hepAssignments[0] ?? null : null;
  const exercises = hep && isExerciseArray(hep.exercises) ? hep.exercises : null;

  const generatedOn = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="patient-brief-page">
      <PatientBriefTopbar />

      <div className="patient-brief-doc">
        <div className="patient-brief-header">
          <div>
            <div className="patient-brief-clinic-name">{clinicianClinicName || "Limbic Center for Physical Therapy"}</div>
            <div className="patient-brief-clinic-tagline">Patient Progress Summary</div>
          </div>
        </div>

        <div className="patient-brief-doc-title">Patient Document</div>
        <div className="patient-brief-meta-grid">
          <div>
            <span className="patient-brief-meta-label">Patient reference: </span>
            <span className="patient-brief-meta-value">{patient.patientCode}</span>
          </div>
          <div>
            <span className="patient-brief-meta-label">Date: </span>
            <span className="patient-brief-meta-value">{generatedOn}</span>
          </div>
          <div>
            <span className="patient-brief-meta-label">Clinician: </span>
            <span className="patient-brief-meta-value">
              {clinicianName}
              {clinicianCredential ? `, ${clinicianCredential}` : ""}
            </span>
          </div>
          <div>
            <span className="patient-brief-meta-label">Visit: </span>
            <span className="patient-brief-meta-value">
              {patient.visitCount} of {patient.totalVisits}
            </span>
          </div>
          {clinicianClinicName && (
            <div>
              <span className="patient-brief-meta-label">Clinic: </span>
              <span className="patient-brief-meta-value">{clinicianClinicName}</span>
            </div>
          )}
          {clinicianEmail && (
            <div>
              <span className="patient-brief-meta-label">Contact: </span>
              <span className="patient-brief-meta-value">{clinicianEmail}</span>
            </div>
          )}
        </div>

        <div className="patient-brief-section">
          <div className="patient-brief-section-title">Progress Summary</div>
          {summary ? (
            <p className="patient-brief-summary-text">{summary}</p>
          ) : (
            <p className="patient-brief-summary-text">No summary has been prepared for this visit yet.</p>
          )}
        </div>

        {hep && (
          <div className="patient-brief-section">
            <div className="patient-brief-section-title">Home Exercise Program</div>
            <div className="patient-brief-hep-name">{hep.hepName}</div>
            {exercises ? (
              <table className="patient-brief-hep-table">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Sets</th>
                    <th>Reps</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((ex, i) => (
                    <tr className="patient-brief-hep-row" key={i}>
                      <td>{ex.name}</td>
                      <td>{ex.sets ?? "—"}</td>
                      <td>{ex.reps ?? "—"}</td>
                      <td>{ex.notes ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="patient-brief-summary-text">See your printed or digital handout for full exercise details.</p>
            )}
          </div>
        )}

        <div className="patient-brief-footer">
          This document was prepared by your physical therapist and does not constitute a complete medical record.
          Contact your clinician directly with any questions about your care. Generated via LimbicPRO on {generatedOn}.
        </div>
      </div>
    </div>
  );
}
