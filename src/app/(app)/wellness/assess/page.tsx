import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ASSESSMENTS } from "@/lib/assessments-static";
import { AssessmentLogButton } from "@/components/metrics/AssessmentLogButton";
import { AssessmentScoreCard } from "@/components/metrics/AssessmentScoreCard";
import type { WellnessProfile } from "@/lib/vitals";

export default async function AssessYourselfPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const row = await prisma.vitalsProfile.findUnique({ where: { userId: user.id } });
  const profile: WellnessProfile = {
    age: row?.age ?? null,
    heightFeet: row?.heightFeet ?? null,
    heightInches: row?.heightInches ?? null,
    weightLbs: row?.weightLbs ?? null,
    biologicalSex: row?.biologicalSex ?? null,
    activityLevel: row?.activityLevel ?? null,
    wellnessGoal: row?.wellnessGoal ?? null,
  };

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Assess Yourself</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Simple movement screens you can do at home — based on physical therapy assessment principles.
      </p>
      <div className="vitals-disclaimer">
        These assessments are for general wellness awareness only. They are not diagnostic tools. If you have pain or concern about your
        movement, consult a licensed physical therapist.
      </div>

      <AssessmentScoreCard profile={profile} />

      <div className="wellness-card-columns">
        {ASSESSMENTS.map((a) => (
          <div key={a.id} className="wellness-assess-card">
            <div className="wellness-calc-title">{a.title}</div>
            <p className="wellness-calc-desc">
              <strong>What it tests:</strong> {a.whatItTests}
            </p>

            <div className="wellness-assess-steps-label">How to do it</div>
            <ol className="wellness-assess-steps">
              {a.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            {a.norms && (
              <div className="wellness-table-wrap">
                <table className="wellness-table">
                  <thead>
                    <tr>
                      <th>Age</th>
                      <th>Poor</th>
                      <th>Fair</th>
                      <th>Good</th>
                      <th>Excellent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.norms.map((row) => (
                      <tr key={row.ageLabel}>
                        <td>{row.ageLabel}</td>
                        <td>{row.poor}</td>
                        <td>{row.fair}</td>
                        <td>{row.good}</td>
                        <td>{row.excellent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {a.normsNote && <p className="wellness-table-note">{a.normsNote}</p>}
              </div>
            )}

            {a.scoringTable && (
              <div className="wellness-table-wrap">
                <table className="wellness-table">
                  <thead>
                    <tr>
                      <th>Score</th>
                      <th>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.scoringTable.map((row) => (
                      <tr key={row.score}>
                        <td>{row.score}</td>
                        <td>{row.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {a.indicatesIfPoor && <p className="wellness-assess-note">{a.indicatesIfPoor}</p>}
            {a.whenToSeePt && <p className="wellness-assess-note">{a.whenToSeePt}</p>}
            {a.interpretationNote && <p className="wellness-assess-note">{a.interpretationNote}</p>}

            {a.checklist && (
              <div className="wellness-assess-checklist">
                {a.checklist.map((item) => (
                  <div key={item.item} className="wellness-assess-checklist-item">
                    <div className="wellness-assess-checklist-item-title">{item.item}</div>
                    <p className="wellness-assess-checklist-item-body">{item.ifItFails}</p>
                    <p className="wellness-assess-checklist-item-helps">{item.whatHelps}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="wellness-calc-source">Source: {a.source}</div>

            {a.metric && a.unitLabel && (
              <AssessmentLogButton metric={a.metric} unitLabel={a.unitLabel} label={a.unitLabel.includes("second") ? "Log your time" : "Log your score"} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
