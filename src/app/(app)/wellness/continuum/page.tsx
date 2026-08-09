import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { REP_CONTINUUM_ZONES, GOAL_ZONE_GUIDANCE } from "@/lib/rep-continuum-static";
import type { WellnessGoal } from "@/lib/vitals";
import { RpeScaleCard } from "@/components/metrics/RpeScaleCard";

export default async function RepContinuumPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.vitalsProfile.findUnique({ where: { userId: user.id } });
  const goal = profile?.wellnessGoal as WellnessGoal | undefined;
  const guidance = goal ? GOAL_ZONE_GUIDANCE[goal] : null;

  return (
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>The Rep Continuum</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 6px" }}>
        Understanding how repetitions and load relate to your training goal.
      </p>
      <p style={{ fontSize: 11.5, color: "var(--color-neutral-600)", margin: "0 0 20px" }}>
        Based on guidelines from the National Strength and Conditioning Association (NSCA) and American College of Sports Medicine
        (ACSM).
      </p>

      <div className="wellness-continuum-bar-wrap">
        <div className="wellness-continuum-bar" />
        {REP_CONTINUUM_ZONES.map((z) => (
          <div key={z.zone} className="wellness-continuum-marker" style={{ left: `${z.barPosition}%` }}>
            <span className="wellness-continuum-marker-dot" />
            <span className="wellness-continuum-marker-label">{z.name}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32, marginBottom: 32 }}>
        {REP_CONTINUUM_ZONES.map((z) => (
          <div key={z.zone} className="wellness-assess-card">
            <div className="wellness-calc-title">
              Zone {z.zone} — {z.name}
            </div>
            <div className="wellness-continuum-stats">
              <div>
                <span className="wellness-continuum-stat-label">Rep range</span>
                <span className="wellness-continuum-stat-value">{z.repRange}</span>
              </div>
              <div>
                <span className="wellness-continuum-stat-label">Load</span>
                <span className="wellness-continuum-stat-value">{z.load}</span>
              </div>
              <div>
                <span className="wellness-continuum-stat-label">Rest</span>
                <span className="wellness-continuum-stat-value">{z.rest}</span>
              </div>
              <div>
                <span className="wellness-continuum-stat-label">Sets</span>
                <span className="wellness-continuum-stat-value">{z.sets}</span>
              </div>
            </div>
            <p className="wellness-calc-desc">
              <strong>Who it&rsquo;s for:</strong> {z.whoItsFor}
            </p>
            <p className="wellness-calc-desc">
              <strong>What it develops:</strong> {z.whatItDevelops}
            </p>
            <p className="wellness-calc-desc">
              <strong>Example exercises:</strong> {z.exampleExercises}
            </p>
            <div className="wellness-calc-source">Source: {z.source}</div>
          </div>
        ))}
      </div>

      <div className="wellness-section-label">Rate Your Effort</div>
      <div style={{ marginBottom: 32 }}>
        <RpeScaleCard />
      </div>

      <div className="wellness-goal-guide">
        <div className="wellness-calc-title">Which zone is right for me?</div>
        {guidance ? (
          <p className="wellness-calc-desc">
            Your wellness goal is <strong>{goal}</strong> — {guidance.note} <strong>{guidance.zones}</strong>
          </p>
        ) : (
          <div>
            <p className="wellness-calc-desc">Set a wellness goal on your Activity Log to see a personalized recommendation. General guidelines:</p>
            <ul className="wellness-assess-steps wellness-assess-steps--bullet">
              {Object.entries(GOAL_ZONE_GUIDANCE).map(([g, info]) => (
                <li key={g}>
                  <strong>{g}</strong> → {info.zones}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-600)", marginTop: 10 }}>
          These are general guidelines. A licensed physical therapist or certified strength coach can help you design a program specific
          to your needs and health history.
        </p>
      </div>
    </div>
  );
}
