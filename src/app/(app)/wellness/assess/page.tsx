import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ASSESSMENTS } from "@/lib/assessments-static";
import { AssessmentLogButton } from "@/components/metrics/AssessmentLogButton";
import { AssessmentScoreCard } from "@/components/metrics/AssessmentScoreCard";
import { PlayIcon } from "@/components/icons";
import type { WellnessProfile } from "@/lib/vitals";

const VIDEO_REFERENCE_TESTS = [
  "Single Leg Stance Test",
  "Wall Sit Test",
  "Sit and Rise Test",
  "Shoulder Mobility Scratch Test",
  "Overhead Squat Screen",
];

function youtubeSearchUrl(testName: string): string {
  const query = `${testName} physical therapy`.toLowerCase();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query).replace(/%20/g, "+")}`;
}

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

      <div className="assess-page-layout">
        <div className="assess-cards-column">
          {ASSESSMENTS.map((a) => (
            <div key={a.id} className="wellness-assess-card assess-test-card">
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

              {a.indicatesIfPoor && <p className="wellness-assess-note">{a.indicatesIfPoor}</p>}
              {a.whenToSeePt && <p className="wellness-assess-note">{a.whenToSeePt}</p>}
              {a.interpretationNote && <p className="wellness-assess-note">{a.interpretationNote}</p>}

              {/* Norms/scoring tables and the movement checklist are what make these cards vary
                 so wildly in height (a 6-row norms table vs. a single short note) — tucked
                 behind a toggle, closed by default, so every card in the grid starts at a
                 similar, symmetrical height and a reader who wants the detail opens it. */}
              {a.norms && (
                <details className="wellness-calc-education">
                  <summary>View age norms</summary>
                  <div className="wellness-table-wrap" style={{ marginTop: 10 }}>
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
                </details>
              )}

              {a.scoringTable && (
                <details className="wellness-calc-education">
                  <summary>View scoring guide</summary>
                  <div className="wellness-table-wrap" style={{ marginTop: 10 }}>
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
                </details>
              )}

              {a.checklist && (
                <details className="wellness-calc-education">
                  <summary>View movement checklist</summary>
                  <div className="wellness-assess-checklist" style={{ marginTop: 10 }}>
                    {a.checklist.map((item) => (
                      <div key={item.item} className="wellness-assess-checklist-item">
                        <div className="wellness-assess-checklist-item-title">{item.item}</div>
                        <p className="wellness-assess-checklist-item-body">{item.ifItFails}</p>
                        <p className="wellness-assess-checklist-item-helps">{item.whatHelps}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div className="wellness-calc-source">Source: {a.source}</div>

              {a.metric && a.unitLabel && <AssessmentLogButton metric={a.metric} unitLabel={a.unitLabel} label="Log" />}
            </div>
          ))}
        </div>

        <aside className="assess-right-panel">
          <div className="assess-right-panel-heading">Video References</div>
          {VIDEO_REFERENCE_TESTS.map((testName) => (
            <div key={testName} className="assess-video-card">
              <div className="assess-video-title">{testName}</div>
              <div className="assess-video-thumb">
                <PlayIcon size={28} className="assess-video-thumb-icon" />
              </div>
              <a
                className="assess-video-link"
                href={youtubeSearchUrl(testName)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch demonstration
              </a>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
