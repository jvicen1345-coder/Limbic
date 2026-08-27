import { plainNormativeComparison, plainLSILabel, plainLSIColor, plainMuscleGroupName } from "@/lib/force-lab-plain-language";
import type { ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";

const GENERIC_MEANING_BULLETS = [
  "Your strength results help guide your treatment plan",
  "Improving symmetry between sides reduces injury risk and improves function",
  "Ask your therapist what these results mean for your specific goals",
];

/** Small inline mark rather than an image asset — this codebase has no existing Limbic
 *  logo file to reuse (the app's own sidebar renders its wordmark as plain text), so this is
 *  a lightweight geometric stand-in sized to the spec's 32px, not a reproduction of any real
 *  brand asset. */
function LimbicMark() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#3b6fe0" />
      <circle cx="16" cy="16" r="6" fill="#ffffff" />
    </svg>
  );
}

/** Patient Report tab on the Force Lab assessment print page (see
 *  ForceLabAssessmentPrintView.tsx, the only caller) — plain-language layout with visual
 *  strength bars and an AI-generated summary, alongside the unchanged Clinical Report.
 *  `normsByMuscleGroup` is the same normative lookup the Clinical Report already computes in
 *  page.tsx, keyed by muscle group so this component doesn't need its own normative fetch. */
export function ForceLabPatientReportBody({
  assessment,
  normsByMuscleGroup,
  clinicianName,
  clinicianCredential,
  clinicianClinicName,
  summary,
}: {
  assessment: ForceLabAssessmentWithSessions;
  normsByMuscleGroup: Map<string, string>;
  clinicianName: string;
  clinicianCredential: string;
  clinicianClinicName: string;
  summary: string | null;
}) {
  const maxValue = Math.max(1, ...assessment.sessions.flatMap((s) => [s.leftPeak ?? 0, s.rightPeak ?? 0]));

  const focusAreas = assessment.sessions
    .filter((s) => s.lsi != null && s.lsi < 85)
    .slice()
    .sort((a, b) => a.lsi! - b.lsi!);

  return (
    <div className="patient-brief-doc pbrief-patient-doc">
      <div className="patient-brief-header">
        <LimbicMark />
        <div>
          <div className="patient-brief-clinic-name">Limbic Center</div>
          <div className="patient-brief-clinic-tagline">limbic.center</div>
        </div>
      </div>

      <div className="pbrief-patient-title-row">
        <h1 className="pbrief-patient-title">Your Strength Assessment</h1>
        <span className="pbrief-patient-title-date">{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
      </div>
      <p className="pbrief-patient-prepared-by">
        Prepared by: {clinicianName}
        {clinicianCredential ? `, ${clinicianCredential}` : ""}
      </p>
      {clinicianClinicName && <p className="pbrief-patient-prepared-by">Practice: {clinicianClinicName}</p>}
      <p className="pbrief-patient-name-line">Name: ________________________</p>
      <hr className="pbrief-patient-rule" />

      <div className="pbrief-patient-section">
        <div className="pbrief-patient-section-title">Your Results at a Glance</div>
        {summary ? (
          <p className="pbrief-patient-summary-text">{summary}</p>
        ) : (
          <p className="pbrief-patient-summary-placeholder">Generate patient summary before printing</p>
        )}
      </div>
      <hr className="pbrief-patient-rule" />

      <div className="pbrief-patient-section">
        <div className="pbrief-patient-section-title">Your Strength Results</div>
        <p className="pbrief-patient-subtitle">
          Results shown as left side and right side. The symmetry score shows how balanced your strength is between sides.
        </p>

        {assessment.sessions.map((s, i) => {
          const isUnilateral = s.lsi == null;
          const testedSide = s.rightPeak != null ? "Right" : "Left";
          const testedValue = s.rightPeak ?? s.leftPeak;
          const normStatus = normsByMuscleGroup.get(s.muscleGroup);

          return (
            <div key={s.id}>
              <div className="pbrief-muscle-card">
                <div className="pbrief-muscle-card-name">{plainMuscleGroupName(s.muscleGroup)}</div>

                {isUnilateral ? (
                  <div className="pbrief-bar-row">
                    <span className="pbrief-bar-label">{testedSide}</span>
                    <span className="pbrief-bar-track">
                      <span
                        className={`pbrief-bar-fill pbrief-bar-fill--${testedSide.toLowerCase()}`}
                        style={{ width: `${Math.min(100, ((testedValue ?? 0) / maxValue) * 100)}%` }}
                      />
                    </span>
                    <span className="pbrief-bar-value">{testedValue ?? "—"} lb</span>
                  </div>
                ) : (
                  <>
                    <div className="pbrief-bar-row">
                      <span className="pbrief-bar-label">Left</span>
                      <span className="pbrief-bar-track">
                        <span className="pbrief-bar-fill pbrief-bar-fill--left" style={{ width: `${Math.min(100, ((s.leftPeak ?? 0) / maxValue) * 100)}%` }} />
                      </span>
                      <span className="pbrief-bar-value">{s.leftPeak ?? "—"} lb</span>
                    </div>
                    <div className="pbrief-bar-row">
                      <span className="pbrief-bar-label">Right</span>
                      <span className="pbrief-bar-track">
                        <span
                          className="pbrief-bar-fill pbrief-bar-fill--right"
                          style={{ width: `${Math.min(100, ((s.rightPeak ?? 0) / maxValue) * 100)}%` }}
                        />
                      </span>
                      <span className="pbrief-bar-value">{s.rightPeak ?? "—"} lb</span>
                    </div>
                    <div className="pbrief-symmetry-row">
                      <span className="pbrief-symmetry-pill" style={{ color: plainLSIColor(s.lsi!), borderColor: plainLSIColor(s.lsi!) }}>
                        {s.lsi}% — {plainLSILabel(s.lsi!)}
                      </span>
                      {normStatus && <span className="pbrief-patient-norm">{plainNormativeComparison(normStatus)}</span>}
                    </div>
                  </>
                )}
              </div>
              {i < assessment.sessions.length - 1 && <hr className="pbrief-muscle-card-rule" />}
            </div>
          );
        })}
      </div>

      {focusAreas.length > 0 && (
        <>
          <hr className="pbrief-patient-rule" />
          <div className="pbrief-patient-section">
            <div className="pbrief-patient-section-title" style={{ color: "#dc2626" }}>
              Areas to Work On
            </div>
            <p className="pbrief-patient-subtitle">Your therapist will focus on these areas in your upcoming sessions.</p>
            {focusAreas.map((s) => (
              <div className="pbrief-focus-row" key={s.id}>
                <span className="pbrief-focus-muscle">{plainMuscleGroupName(s.muscleGroup)}</span>
                <span className="pbrief-focus-label">{plainLSILabel(s.lsi!)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="pbrief-patient-rule" />
      <div className="pbrief-patient-section">
        <div className="pbrief-patient-section-title">What This Means For You</div>
        <ul className="pbrief-patient-bullets">
          {GENERIC_MEANING_BULLETS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="pbrief-patient-note-space" />
      </div>

      <div className="pbrief-patient-footer">
        <span>This report was prepared by your physical therapist. Contact your clinician with any questions.</span>
        <span>Generated with Limbic Center — limbic.center</span>
      </div>
    </div>
  );
}
