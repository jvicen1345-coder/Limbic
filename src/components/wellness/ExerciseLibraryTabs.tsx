"use client";

import { useState } from "react";
import { SlidingTabs } from "@/components/SlidingTabs";
import { PlayIcon } from "@/components/icons";
import { EXERCISES } from "@/lib/exercises-static";
import { REP_CONTINUUM_ZONES, GOAL_ZONE_GUIDANCE } from "@/lib/rep-continuum-static";
import type { WellnessGoal } from "@/lib/vitals";
import { RpeScaleCard } from "@/components/metrics/RpeScaleCard";

type Tab = "exercises" | "continuum";

const TABS: { id: Tab; label: string }[] = [
  { id: "exercises", label: "Top 10 Exercises" },
  { id: "continuum", label: "Rep Continuum" },
];

/** Top 10 Exercises and Rep Continuum used to be two separate Health & Wellness sidebar
 *  rows/routes (/wellness/exercises, /wellness/continuum) — merged onto one page,
 *  "Exercise Library", since both are static exercise-reference content with no
 *  interactivity beyond what each already had. /wellness/continuum now redirects here
 *  (see its page.tsx).
 *
 *  goal is the reader's wellnessGoal, fetched server-side from VitalsProfile by
 *  app/(app)/wellness/exercises/page.tsx and passed down rather than queried here, since
 *  this is a client component (it needs to own the tab-switch state). */
export function ExerciseLibraryTabs({ goal }: { goal: WellnessGoal | null }) {
  const [tab, setTab] = useState<Tab>("exercises");
  const guidance = goal ? GOAL_ZONE_GUIDANCE[goal] : null;

  return (
    <>
      <SlidingTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "exercises" && (
        <div style={{ marginTop: 16 }}>
          <div className="vitals-disclaimer">
            Consult your physician or a licensed physical therapist before starting any new exercise program to
            ensure these exercises are appropriate for you.
          </div>

          <div className="assess-page-layout">
            {EXERCISES.map((ex, i) => [
              <div key={ex.id} className="wellness-assess-card assess-test-card">
                <div className="wellness-exercise-header">
                  <span className="wellness-exercise-number">{i + 1}</span>
                  <div className="wellness-calc-title" style={{ margin: 0 }}>
                    {ex.name}
                  </div>
                  <span className={`wellness-difficulty-badge wellness-difficulty-badge--${ex.difficulty.toLowerCase()}`}>
                    {ex.difficulty}
                  </span>
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
      )}

      {tab === "continuum" && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-600)", margin: "0 0 20px" }}>
            Based on guidelines from the National Strength and Conditioning Association (NSCA) and American College
            of Sports Medicine (ACSM).
          </p>

          <div className="wellness-continuum-layout">
            <aside className="wellness-continuum-sidebar">
              <div className="wellness-goal-guide">
                <div className="wellness-calc-title">Which zone is right for me?</div>
                {guidance ? (
                  <p className="wellness-calc-desc">
                    Your wellness goal is <strong>{goal}</strong>, {guidance.note} <strong>{guidance.zones}</strong>
                  </p>
                ) : (
                  <div>
                    <p className="wellness-calc-desc">
                      Set a wellness goal on your Activity Log to see a personalized recommendation. General
                      guidelines:
                    </p>
                    <ul className="wellness-assess-steps wellness-assess-steps--bullet">
                      {Object.entries(GOAL_ZONE_GUIDANCE).map(([g, info]) => (
                        <li key={g}>
                          <strong>{g}</strong> → {info.zones}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-600)", marginTop: 10 }}>
                  These are general guidelines. A licensed physical therapist or certified strength coach can help
                  you design a program specific to your needs and health history.
                </p>
              </div>
            </aside>

            <div className="wellness-continuum-main">
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
                      Zone {z.zone}, {z.name}
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
              <RpeScaleCard />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
