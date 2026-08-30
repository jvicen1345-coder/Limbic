import { plainNormativeComparison, plainLSILabel, plainLSIColor, plainMuscleGroupName, plainFocusAreaSentence } from "@/lib/force-lab-plain-language";
import type { ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";

const NEXT_STEPS = [
  "Continue your home exercise program as prescribed",
  "Attend your scheduled therapy sessions",
  "Contact your therapist if you notice any changes in your symptoms",
];

// Same floor the Areas to Work On section itself filters on below — an LSI under this is
// worth a patient's attention, so it also counts toward "Needs attention" in the overview
// card instead of getting split further into the pill's own five-tier scale.
const NEEDS_ATTENTION_LSI = 80;
const EXCELLENT_LSI = 95;

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
  clinicianEmail,
  summary,
}: {
  assessment: ForceLabAssessmentWithSessions;
  normsByMuscleGroup: Map<string, string>;
  clinicianName: string;
  clinicianCredential: string;
  clinicianClinicName: string;
  clinicianEmail: string | null;
  summary: string | null;
}) {
  const maxValue = Math.max(1, ...assessment.sessions.flatMap((s) => [s.leftPeak ?? 0, s.rightPeak ?? 0]));

  // Every muscle group below 80% LSI, not just the single lowest — ordered ascending so the
  // most-affected side leads the section (e.g. a 34.7% result reads before a 56.8% one).
  const focusAreas = assessment.sessions
    .filter((s) => s.lsi != null && s.lsi < NEEDS_ATTENTION_LSI)
    .slice()
    .sort((a, b) => a.lsi! - b.lsi!);

  const bilateralLsis = assessment.sessions.map((s) => s.lsi).filter((lsi): lsi is number => lsi != null);
  const excellentCount = bilateralLsis.filter((lsi) => lsi >= EXCELLENT_LSI).length;
  const goodCount = bilateralLsis.filter((lsi) => lsi >= NEEDS_ATTENTION_LSI && lsi < EXCELLENT_LSI).length;
  const needsAttentionCount = bilateralLsis.filter((lsi) => lsi < NEEDS_ATTENTION_LSI).length;

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

      <div className="pbrief-overview-card">
        <div className="pbrief-overview-title">Overall Strength Summary</div>
        <div className="pbrief-overview-tested">{assessment.sessions.length} muscle groups tested</div>
        <div className="pbrief-overview-row">
          <span className="pbrief-overview-dot pbrief-overview-dot--green" />
          <span className="pbrief-overview-count">{excellentCount}</span> Excellent symmetry
        </div>
        <div className="pbrief-overview-row">
          <span className="pbrief-overview-dot pbrief-overview-dot--green" />
          <span className="pbrief-overview-count">{goodCount}</span> Good symmetry
        </div>
        <div className="pbrief-overview-row">
          <span className="pbrief-overview-dot pbrief-overview-dot--red" />
          <span className="pbrief-overview-count">{needsAttentionCount}</span> Needs attention
        </div>
      </div>
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

          // No symmetry score to color-code a unilateral test by — left with the neutral
          // border every card starts from, rather than colored on some rows and not others.
          const accentColor = isUnilateral ? "transparent" : plainLSIColor(s.lsi!);

          return (
            <div key={s.id}>
              <div className="pbrief-muscle-card" style={{ borderLeftColor: accentColor }}>
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
                        {plainLSILabel(s.lsi!)}
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
              <div className="pbrief-focus-item" key={s.id}>
                <div className="pbrief-focus-muscle">{plainMuscleGroupName(s.muscleGroup)}</div>
                <p className="pbrief-focus-sentence">{plainFocusAreaSentence(s.muscleGroup, s.leftPeak, s.rightPeak, s.lsi!)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="pbrief-patient-rule" />
      <div className="pbrief-patient-section">
        <div className="pbrief-patient-section-title">What This Means For You</div>
        {summary && <p className="pbrief-patient-summary-text pbrief-patient-summary-recap">{summary}</p>}

        <div className="pbrief-next-steps-title">Your Next Steps</div>
        <ul className="pbrief-patient-bullets">
          {NEXT_STEPS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <div className="pbrief-next-steps-title">Questions About Your Results?</div>
        {clinicianEmail && <p className="pbrief-patient-contact">Contact: {clinicianEmail}</p>}
        {clinicianClinicName && <p className="pbrief-patient-contact">{clinicianClinicName}</p>}
      </div>

      <div className="pbrief-patient-footer">
        <span>This report was prepared by your physical therapist. Contact your clinician with any questions.</span>
        <span>Generated with Limbic Center — limbic.center</span>
      </div>
    </div>
  );
}
