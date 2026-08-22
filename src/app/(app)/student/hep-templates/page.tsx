import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { templatesByBodyPart, HEP_TEMPLATE_BODY_PARTS } from "@/lib/coursework-hep-templates";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { LimbicStudentGate } from "@/components/student/LimbicStudentGate";

const SUBTITLE = "Example home exercise programs, organized by body region, for studying how a program is built.";

export default async function CourseworkHepTemplatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="HEP Templates" subtitle={SUBTITLE}>
        <StudentGate toolName="HEP Templates" />
      </StudentPlaceholderPage>
    );
  }

  if (user.studentTier !== "limbicStudent") {
    return (
      <StudentPlaceholderPage title="HEP Templates" subtitle={SUBTITLE}>
        <LimbicStudentGate toolName="HEP Templates" />
      </StudentPlaceholderPage>
    );
  }

  const grouped = templatesByBodyPart();

  return (
    <StudentPlaceholderPage title="HEP Templates" subtitle={SUBTITLE}>
      <div className="vitals-disclaimer" style={{ marginTop: 14 }}>
        These are illustrative teaching examples for coursework study, not treatment prescriptions for any real
        patient — always base actual patient care on individual evaluation findings and current clinical practice
        guidelines.
      </div>

      {HEP_TEMPLATE_BODY_PARTS.map((bodyPart) => {
        const templates = grouped[bodyPart];
        if (templates.length === 0) return null;
        return (
          <div key={bodyPart} style={{ marginTop: 22 }}>
            <div className="atrium-section-label" style={{ marginBottom: 10 }}>
              {bodyPart}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {templates.map((t) => (
                <details key={t.id} className="card elev-sm">
                  <summary className="pro-accordion-summary">
                    <div>
                      <div>{t.name}</div>
                      <div className="pro-accordion-summary-sub">{t.goal}</div>
                    </div>
                  </summary>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    {t.exercises.map((ex, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{ex.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{ex.dosage}</div>
                        <p style={{ fontSize: 12.5, margin: "4px 0 0" }}>{ex.note}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        );
      })}
    </StudentPlaceholderPage>
  );
}
