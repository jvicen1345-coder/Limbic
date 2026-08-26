"use client";

import { useEffect, useState, useTransition } from "react";
import { bodyRegions, muscleGroups } from "@/lib/force-lab-muscles";
import { calculateDifference, calculateLSI, calculatePercentDiff, getLSIStatus, getNormativeComparison, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import { createForceLabSession, getNormativeData, type ForceLabNormMatch } from "@/app/actions/force-lab";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import type { ForceLabSession } from "@/generated/prisma/client";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function lsiStatusColor(status: "normal" | "caution" | "deficit"): string {
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

const NORM_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  above_norm: { label: "Above norm", color: FORCE_LAB_GREEN },
  within_norm: { label: "Within norm", color: FORCE_LAB_GREEN },
  below_norm: { label: "Below norm", color: FORCE_LAB_AMBER },
  significantly_below: { label: "Significantly below norm", color: FORCE_LAB_RED },
};

export interface ForceLabPrefill {
  muscleGroup?: string;
  rightPeak?: number;
  leftPeak?: number;
  rightTimeToPeak?: number;
  leftTimeToPeak?: number;
  unit?: string;
  confidence?: number;
}

/** The Manual Entry form — also reused, pre-populated, for the Import Screenshot tab's
 *  review step (see ForceLabImportPanel.tsx), per the spec's "Show all parsed fields
 *  pre-populated in the same form layout as Manual Entry." `prefill`/`importedFrom`/
 *  `previewImageSrc` are only ever passed from the import flow — plain Manual Entry omits
 *  all three. */
export function ForceLabEntryForm({
  patients,
  forceUnit,
  initialPatientId,
  prefill,
  importedFrom,
  previewImageSrc,
  onSaved,
  onPatientChange,
}: {
  patients: PatientListEntry[];
  forceUnit: string;
  initialPatientId: string | null;
  prefill?: ForceLabPrefill;
  importedFrom?: string;
  previewImageSrc?: string;
  onSaved: (session: ForceLabSession) => void;
  /** Fires on every "Link to Patient" change — lets ForceLabWorkspace.tsx keep the right
   *  column's Strength Profile in sync with whichever patient the clinician is actively
   *  entering data for, before the session is even saved. */
  onPatientChange?: (patientId: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [region, setRegion] = useState(() => {
    if (prefill?.muscleGroup) {
      const found = Object.entries(muscleGroups).find(([, muscles]) => muscles.includes(prefill.muscleGroup!));
      if (found) return found[0];
    }
    return bodyRegions[0];
  });
  const [muscleGroup, setMuscleGroup] = useState(() => prefill?.muscleGroup ?? muscleGroups[bodyRegions[0]][0]);
  const [sessionDate, setSessionDate] = useState(todayStr());
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [unit, setUnit] = useState(prefill?.unit === "kg" ? "kg" : forceUnit === "kg" ? "kg" : "lbs");
  const [rightPeak, setRightPeak] = useState(prefill?.rightPeak != null ? String(prefill.rightPeak) : "");
  const [leftPeak, setLeftPeak] = useState(prefill?.leftPeak != null ? String(prefill.leftPeak) : "");
  const [rightTimeToPeak, setRightTimeToPeak] = useState(prefill?.rightTimeToPeak != null ? String(prefill.rightTimeToPeak) : "");
  const [leftTimeToPeak, setLeftTimeToPeak] = useState(prefill?.leftTimeToPeak != null ? String(prefill.leftTimeToPeak) : "");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [norm, setNorm] = useState<ForceLabNormMatch | null>(null);

  const rightNum = parseFloat(rightPeak);
  const leftNum = parseFloat(leftPeak);
  const hasBoth = !isNaN(rightNum) && !isNaN(leftNum);
  const difference = hasBoth ? calculateDifference(rightNum, leftNum) : null;
  const percentDiff = hasBoth ? calculatePercentDiff(rightNum, leftNum) : null;
  const lsi = hasBoth ? calculateLSI(Math.min(rightNum, leftNum), Math.max(rightNum, leftNum)) : null;
  const lsiStatus = lsi != null ? getLSIStatus(lsi) : null;

  const ageNum = parseInt(age, 10);
  const hasNormInputs = !isNaN(ageNum) && !!sex && (!isNaN(rightNum) || !isNaN(leftNum));

  // Async norm lookup — the effect itself never calls setState synchronously (only inside
  // the .then() below), same "no sync setState in a bare effect body" pattern this repo's
  // react-hooks/set-state-in-effect rule requires elsewhere (see ClinicianDashboard.tsx's
  // own patient-detail effect).
  useEffect(() => {
    let cancelled = false;
    const comparisonSide = !isNaN(rightNum) && (isNaN(leftNum) || rightNum >= leftNum) ? "right" : "left";
    const promise = hasNormInputs ? getNormativeData(muscleGroup, ageNum, sex, comparisonSide) : Promise.resolve(null);
    promise.then((result) => {
      if (!cancelled) setNorm(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muscleGroup, ageNum, sex, hasNormInputs]);

  const comparisonValue = !isNaN(rightNum) && (isNaN(leftNum) || rightNum >= leftNum) ? rightNum : leftNum;
  const normComparison = norm && !isNaN(comparisonValue) ? getNormativeComparison(comparisonValue, norm.meanLbs, norm.sdLbs) : null;

  const handleRegionChange = (nextRegion: string) => {
    setRegion(nextRegion);
    setMuscleGroup(muscleGroups[nextRegion][0]);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await createForceLabSession({
        muscleGroup,
        bodyRegion: region,
        patientId: patientId || undefined,
        sessionDate,
        rightPeak: isNaN(rightNum) ? undefined : rightNum,
        leftPeak: isNaN(leftNum) ? undefined : leftNum,
        rightTimeToPeak: rightTimeToPeak.trim() ? parseFloat(rightTimeToPeak) : undefined,
        leftTimeToPeak: leftTimeToPeak.trim() ? parseFloat(leftTimeToPeak) : undefined,
        unit,
        notes: notes.trim() || undefined,
        importedFrom,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved(result.session);
    });
  };

  return (
    <div className="forcelab-entry-form">
      <div className="forcelab-entry-layout">
        <div className="forcelab-entry-fields">
          <div className="forcelab-form-section">
            <div className="forcelab-form-section-title">Session Info</div>
            <div className="clindash-inline-form-row">
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="fl-region">Body Region</label>
                <select className="input" id="fl-region" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
                  {bodyRegions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="fl-muscle">Muscle Group</label>
                <select className="input" id="fl-muscle" value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}>
                  {muscleGroups[region].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="clindash-inline-form-row" style={{ marginTop: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="fl-date">Session Date</label>
                <input className="input" id="fl-date" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="fl-patient">Link to Patient</label>
                <select
                  className="input"
                  id="fl-patient"
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    onPatientChange?.(e.target.value);
                  }}
                >
                  <option value="">Not linked</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patientCode} — {p.condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="forcelab-form-section">
            <div className="forcelab-form-section-title-row">
              <div className="forcelab-form-section-title">Force Measurements</div>
              <div className="forcelab-unit-toggle">
                <button type="button" className={unit === "lbs" ? "forcelab-unit-btn forcelab-unit-btn--active" : "forcelab-unit-btn"} onClick={() => setUnit("lbs")}>
                  lbs
                </button>
                <button type="button" className={unit === "kg" ? "forcelab-unit-btn forcelab-unit-btn--active" : "forcelab-unit-btn"} onClick={() => setUnit("kg")}>
                  kg
                </button>
              </div>
            </div>
            <div className="forcelab-measurement-columns">
              <div className="forcelab-measurement-col">
                <div className="forcelab-measurement-col-title forcelab-measurement-col-title--right">Right Side</div>
                <div className="field">
                  <label htmlFor="fl-right-peak">Peak Force ({unit})</label>
                  <input className="input" id="fl-right-peak" type="number" step="0.1" value={rightPeak} onChange={(e) => setRightPeak(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="fl-right-ttp">Time to Peak (seconds)</label>
                  <input className="input" id="fl-right-ttp" type="number" step="0.1" value={rightTimeToPeak} onChange={(e) => setRightTimeToPeak(e.target.value)} />
                </div>
              </div>
              <div className="forcelab-measurement-col">
                <div className="forcelab-measurement-col-title forcelab-measurement-col-title--left">Left Side</div>
                <div className="field">
                  <label htmlFor="fl-left-peak">Peak Force ({unit})</label>
                  <input className="input" id="fl-left-peak" type="number" step="0.1" value={leftPeak} onChange={(e) => setLeftPeak(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="fl-left-ttp">Time to Peak (seconds)</label>
                  <input className="input" id="fl-left-ttp" type="number" step="0.1" value={leftTimeToPeak} onChange={(e) => setLeftTimeToPeak(e.target.value)} />
                </div>
              </div>
            </div>

            {hasBoth && (
              <div className="forcelab-calculated-row">
                <span>
                  Difference: <strong>{difference} {unit}</strong>
                </span>
                <span>
                  Percent Difference: <strong>{percentDiff}%</strong>
                </span>
                <span style={{ color: lsi != null ? lsiStatusColor(lsiStatus!) : undefined }}>
                  LSI: <strong>{lsi}%</strong>
                </span>
              </div>
            )}
          </div>

          <div className="forcelab-form-section">
            <div className="forcelab-form-section-title">Normative Comparison</div>
            <div className="clindash-inline-form-row">
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="fl-age">Patient Age (optional)</label>
                <input className="input" id="fl-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="fl-sex">Patient Sex (optional)</label>
                <select className="input" id="fl-sex" value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            {hasNormInputs && norm && normComparison && (
              <div className="forcelab-norm-result">
                <p>
                  Normative mean for {norm.ageMin}–{norm.ageMax} {sex}: {norm.meanLbs} lbs — Source: {norm.source}
                </p>
                <span className="forcelab-norm-pill" style={{ color: NORM_STATUS_LABEL[normComparison].color }}>
                  {NORM_STATUS_LABEL[normComparison].label}
                </span>
              </div>
            )}
            {hasNormInputs && !norm && <p className="forcelab-norm-none">No normative data available for this muscle group.</p>}
          </div>

          <div className="forcelab-form-section">
            <div className="forcelab-form-section-title">Notes</div>
            <textarea
              className="input"
              placeholder="Clinical observations, patient position, test conditions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {prefill && (
            <p className={`forcelab-confidence ${(prefill.confidence ?? 1) < 0.85 ? "forcelab-confidence--low" : ""}`}>
              Extraction confidence: {Math.round((prefill.confidence ?? 0) * 100)}%
            </p>
          )}
          {prefill && <p className="forcelab-review-notice">Review all values before saving. You are responsible for accuracy.</p>}

          {error && <p style={{ fontSize: 12.5, color: "var(--color-danger)", margin: "8px 0 0" }}>{error}</p>}
          <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} disabled={pending} onClick={handleSave}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>

        {previewImageSrc && (
          <div className="forcelab-preview-col">
            {/* eslint-disable-next-line @next/next/no-img-element -- an ephemeral client-side object URL, not a static/remote asset next/image can optimize */}
            <img src={previewImageSrc} alt="Uploaded ActiveForce screenshot" className="forcelab-preview-image" />
          </div>
        )}
      </div>
    </div>
  );
}
