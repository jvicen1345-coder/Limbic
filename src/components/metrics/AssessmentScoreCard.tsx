"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateAssessmentScore } from "@/lib/assessment-scoring";
import type { WellnessProfile } from "@/lib/vitals";

const BAND_CLASS: Record<string, string> = {
  Poor: "wellness-badge-poor",
  Fair: "wellness-badge-fair",
  Good: "wellness-badge-good",
  Excellent: "wellness-badge-excellent",
};

/** A composite score across the three assessments below that have population norms tables
 *  (Single Leg Stance, Sit and Rise, Wall Sit) — Shoulder Scratch is a symmetry check and
 *  Overhead Squat a movement-quality checklist, neither has a single-number population norm
 *  to score against, so both stay observational-only. Rated on the same Poor/Fair/Good/
 *  Excellent scale already used in this page's norms tables (see lib/assessment-scoring.ts). */
export function AssessmentScoreCard({ profile }: { profile: WellnessProfile }) {
  const [singleLeg, setSingleLeg] = useState("");
  const [sitRise, setSitRise] = useState("");
  const [wallSit, setWallSit] = useState("");

  const hasProfile = profile.age != null && profile.age > 0 && profile.biologicalSex != null;
  const sex = profile.biologicalSex === "Male" ? "male" : "female";

  const result = hasProfile
    ? calculateAssessmentScore({
        age: profile.age!,
        sex,
        singleLegStanceSeconds: singleLeg.trim() ? Number(singleLeg) : undefined,
        sitAndRiseScore: sitRise.trim() ? Number(sitRise) : undefined,
        wallSitSeconds: wallSit.trim() ? Number(wallSit) : undefined,
      })
    : null;

  return (
    <div className="wellness-calc-card" style={{ marginBottom: 24 }}>
      <div className="wellness-calc-title">Your Functional Fitness Score</div>
      <p className="wellness-calc-desc">
        Enter your results from the Single Leg Stance, Sit and Rise, and Wall Sit tests below to see a combined score, rated on the same
        Poor / Fair / Good / Excellent scale used throughout this page&rsquo;s norms tables.
      </p>

      {!hasProfile ? (
        <div className="wellness-calc-missing-profile">
          Add your age and biological sex on the <Link href="/wellness/metrics#body-metrics">Metrics page</Link> to score your results, these tests
          are judged against age- (and for Wall Sit, sex-) adjusted norms.
        </div>
      ) : (
        <>
          <div className="wellness-calc-inputs">
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label htmlFor="score-single-leg">Single Leg Stance (sec)</label>
              <input className="input" id="score-single-leg" type="number" min={0} value={singleLeg} onChange={(e) => setSingleLeg(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label htmlFor="score-sit-rise">Sit and Rise (score /10)</label>
              <input className="input" id="score-sit-rise" type="number" min={0} max={10} step={0.5} value={sitRise} onChange={(e) => setSitRise(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 140 }}>
              <label htmlFor="score-wall-sit">Wall Sit (sec)</label>
              <input className="input" id="score-wall-sit" type="number" min={0} value={wallSit} onChange={(e) => setWallSit(e.target.value)} />
            </div>
          </div>

          {result ? (
            <div className="wellness-calc-result">
              <div className="wellness-calc-result-row">
                <span className="wellness-calc-result-value">{result.averageBand.toFixed(1)} / 4</span>
                <span className={`wellness-badge ${BAND_CLASS[result.label]}`}>{result.label}</span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: 8 }}>
                Based on {result.includedCount} of 3 scored tests. Fill in more results above for a fuller picture.
              </p>
            </div>
          ) : (
            <p className="wellness-calc-desc" style={{ marginTop: 4 }}>Enter at least one result above to see your score.</p>
          )}
        </>
      )}

      <div className="wellness-calc-source">
        Scoring bands drawn from the same sources cited per test below, this composite is a general wellness indicator, not a validated
        clinical instrument.
      </div>
    </div>
  );
}
