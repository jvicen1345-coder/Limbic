import { getCurrentUser } from "@/lib/session";
import { EXERCISES } from "@/lib/exercises-static";
import { PlayIcon } from "@/components/icons";

export default async function TopExercisesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Top 10 Exercises</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Impactful, functional exercises for general health, with guidance on how to perform them safely.
      </p>
      <div className="vitals-disclaimer">
        Consult your physician or a licensed physical therapist before starting any new exercise program to ensure these exercises are
        appropriate for you.
      </div>

      <div className="assess-page-layout">
        {EXERCISES.map((ex, i) => [
          <div key={ex.id} className="wellness-assess-card assess-test-card">
            <div className="wellness-exercise-header">
              <span className="wellness-exercise-number">{i + 1}</span>
              <div className="wellness-calc-title" style={{ margin: 0 }}>
                {ex.name}
              </div>
              <span className={`wellness-difficulty-badge wellness-difficulty-badge--${ex.difficulty.toLowerCase()}`}>{ex.difficulty}</span>
            </div>

            <div className="wellness-muscle-chips">
              {ex.muscles.map((m) => (
                <span key={m} className="wellness-muscle-chip">
                  {m}
                </span>
              ))}
            </div>

            <p className="wellness-calc-desc">{ex.benefits}</p>

            <div className="wellness-assess-steps-label">How to perform</div>
            <ol className="wellness-assess-steps">
              {ex.steps.map((step, si) => (
                <li key={si}>{step}</li>
              ))}
            </ol>

            <div className="wellness-assess-steps-label">Common errors</div>
            <ul className="wellness-assess-steps wellness-assess-steps--bullet">
              {ex.commonErrors.map((err, ei) => (
                <li key={ei}>{err}</li>
              ))}
            </ul>

            <div className="wellness-exercise-progressions">
              <div>
                <div className="wellness-exercise-progression-label">Beginner regression</div>
                <p className="wellness-exercise-progression-text">{ex.regression}</p>
              </div>
              <div>
                <div className="wellness-exercise-progression-label">Advanced progression</div>
                <p className="wellness-exercise-progression-text">{ex.progression}</p>
              </div>
            </div>

            <div className="wellness-calc-source">{ex.setsReps}</div>
          </div>,

          <div key={`${ex.id}-video`} className="assess-video-cell">
            {i === 0 && <div className="assess-right-panel-heading">Video References</div>}
            <div className="assess-video-card">
              <div className="assess-video-title">{ex.name}</div>
              <div className="assess-video-thumb">
                <PlayIcon size={28} className="assess-video-thumb-icon" />
              </div>
              <a className="assess-video-link" href={ex.youtubeUrl} target="_blank" rel="noopener noreferrer">
                Watch demonstration
              </a>
            </div>
          </div>,
        ])}
      </div>
    </div>
  );
}
