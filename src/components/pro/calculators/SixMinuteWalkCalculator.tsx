"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";

const M_PER_FT = 0.3048;

// The real published Enright & Sherrill (1998) reference equation for predicted 6MWT
// distance, plus its companion lower limit of normal (predicted minus a fixed offset per
// sex), from the same paper.
function predictedSixMinuteWalkDistanceMeters(ageYears: number, sex: "male" | "female", heightCm: number, weightKg: number): number {
  const base = sex === "male" ? 7.57 * heightCm - 5.02 * ageYears - 1.76 * weightKg - 309 : 2.11 * heightCm - 2.29 * weightKg - 5.78 * ageYears + 667;
  return Math.max(0, Math.round(base));
}

function lowerLimitOfNormalMeters(predicted: number, sex: "male" | "female"): number {
  return Math.max(0, Math.round(predicted - (sex === "male" ? 153 : 139)));
}

/** Fully functional — unit conversion (m/ft), the built-in 6-minute countdown (see
 *  CalcTimer), and the real validated Enright & Sherrill predicted-distance regression
 *  equation with its lower limit of normal are all live. */
export function SixMinuteWalkCalculator() {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<"m" | "ft">("m");
  const [distance, setDistance] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("female");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const distanceNum = Number(distance);
  const distanceMeters = distance !== "" && Number.isFinite(distanceNum) ? (unit === "m" ? distanceNum : distanceNum * M_PER_FT) : null;

  const ageNum = Number(age);
  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);
  const canPredict = [ageNum, heightNum, weightNum].every((n) => Number.isFinite(n) && n > 0);
  const predicted = canPredict ? predictedSixMinuteWalkDistanceMeters(ageNum, sex, heightNum, weightNum) : null;
  const lln = predicted != null ? lowerLimitOfNormalMeters(predicted, sex) : null;
  const percentPredicted = predicted && distanceMeters != null && predicted > 0 ? Math.round((distanceMeters / predicted) * 100) : null;

  return (
    <>
      <CalcCardShell
        name="6 Minute Walk Test"
        fullName="6MWT"
        measures="Sub-maximal aerobic capacity and functional exercise tolerance."
        population="Cardiopulmonary, general deconditioning"
        itemCount="1 item"
        onOpen={() => setOpen(true)}
      />
      <CalcModal
        open={open}
        title="6 Minute Walk Test"
        onClose={() => setOpen(false)}
        testKey="sixmwt"
        testName="6 Minute Walk Test"
        result={
          predicted != null
            ? {
                value: `${predicted} m predicted`,
                label: `${percentPredicted != null ? `${percentPredicted}% of predicted distance, ` : ""}Lower limit of normal: ${lln} m`,
              }
            : null
        }
      >
        <CalcTimer mode="countdown" durationSeconds={360} />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="six-mwt-distance">Distance walked</label>
            <input
              id="six-mwt-distance"
              className="input"
              type="number"
              min={0}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          <div className="field" style={{ width: 110 }}>
            <label htmlFor="six-mwt-unit">Unit</label>
            <select id="six-mwt-unit" className="input" value={unit} onChange={(e) => setUnit(e.target.value as "m" | "ft")}>
              <option value="m">Meters</option>
              <option value="ft">Feet</option>
            </select>
          </div>
        </div>
        {distanceMeters != null && (
          <p style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 6 }}>
            = {distanceMeters.toFixed(1)} m / {(distanceMeters / M_PER_FT).toFixed(1)} ft
          </p>
        )}

        <div className="pro-grid-2" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="six-mwt-age">Age, years</label>
            <input id="six-mwt-age" className="input" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="six-mwt-sex">Sex</label>
            <select id="six-mwt-sex" className="input" value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="six-mwt-height">Height, cm</label>
            <input id="six-mwt-height" className="input" type="number" min={0} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="six-mwt-weight">Weight, kg</label>
            <input id="six-mwt-weight" className="input" type="number" min={0} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </div>
        </div>

        {predicted != null && (
          <div className="pro-calc-result" style={{ marginTop: 14 }}>
            <div className="pro-calc-result-value">{predicted} m predicted</div>
            <div className="pro-calc-result-label">
              {percentPredicted != null ? `${percentPredicted}% of predicted distance, ` : ""}
              Lower limit of normal: {lln} m
            </div>
          </div>
        )}
        <p style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 10 }}>
          Source: Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. Am J Respir
          Crit Care Med. 1998. Minimal detectable change: ~54 meters (community-dwelling older adults); MCID is
          highly condition-dependent, ranging from roughly 15 to 195 meters across published populations.
        </p>
      </CalcModal>
    </>
  );
}
