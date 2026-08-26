"use client";

import { useState, useTransition } from "react";
import { createForceLabAssessment, parseAssessmentText, type ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import { getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { ParsedAssessment, ParsedMuscleGroup } from "@/lib/force-lab-parser";

function lsiColor(lsi: number | undefined): string {
  if (lsi == null) return "var(--color-neutral-700)";
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

const EMPTY_META = { identifier: "", assessmentDate: "", weight: "", weightUnit: "kg", age: "", sex: "", dominantSide: "" };

/** Third center-column tab (see ForceLabWorkspace.tsx) — paste, parse, review/edit, save.
 *  Two-step "generate then confirm" like the Import Screenshot tab: parseAssessmentText
 *  never saves, createForceLabAssessment only runs once the clinician confirms the
 *  (possibly hand-edited) preview. */
export function PasteAssessmentPanel({
  patients,
  initialPatientId,
  onSaved,
  onPatientChange,
}: {
  patients: PatientListEntry[];
  initialPatientId: string | null;
  onSaved: (assessment: ForceLabAssessmentWithSessions) => void;
  onPatientChange?: (patientId: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedAssessment | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<ParsedMuscleGroup[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [patientId, setPatientId] = useState<string>(initialPatientId ?? "");
  const [autoMatchedCode, setAutoMatchedCode] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleParse = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await parseAssessmentText(rawText);
      if (!result || result.muscleGroups.length === 0) {
        setError("Could not find muscle group data in this text. Make sure you copied the full export from ActiveForce.");
        return;
      }
      setParsed(result);
      setMuscleGroups(result.muscleGroups);
      setMeta({
        identifier: result.identifier ?? "",
        assessmentDate: result.assessmentDate ?? "",
        weight: result.patientWeight != null ? String(result.patientWeight) : "",
        weightUnit: result.patientWeightUnit ?? "kg",
        age: result.patientAge != null ? String(result.patientAge) : "",
        sex: result.patientSex ?? "",
        dominantSide: result.dominantSide ?? "",
      });
      const match = result.identifier ? patients.find((p) => p.patientCode === result.identifier) : undefined;
      if (match) {
        setPatientId(match.id);
        setAutoMatchedCode(match.patientCode);
        onPatientChange?.(match.id);
      } else {
        setAutoMatchedCode(null);
      }
    });
  };

  const handleClear = () => {
    setRawText("");
    setParsed(null);
    setMuscleGroups([]);
    setMeta(EMPTY_META);
    setPatientId(initialPatientId ?? "");
    setAutoMatchedCode(null);
    setNotes("");
    setError(null);
    setSaved(false);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await createForceLabAssessment({
        rawText,
        identifier: meta.identifier || undefined,
        assessmentDate: meta.assessmentDate || undefined,
        patientWeight: meta.weight ? Number(meta.weight) : undefined,
        patientWeightUnit: meta.weightUnit || undefined,
        patientAge: meta.age ? Number(meta.age) : undefined,
        patientSex: meta.sex || undefined,
        dominantSide: meta.dominantSide || undefined,
        patientId: patientId || undefined,
        notes: notes || undefined,
        muscleGroups,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved(result.assessment);
      handleClear();
      setSaved(true);
    });
  };

  if (!parsed) {
    return (
      <div className="forcelab-import-instructions">
        <p>Copy your full session from the ActiveForce app — tap Share or Export — then paste it here.</p>
        <p>1. Copy from ActiveForce → 2. Paste below → 3. Review and save</p>

        {saved && <p className="forcelab-paste-confirmation">Assessment saved.</p>}

        <textarea
          className="input forcelab-paste-textarea"
          placeholder="Paste your ActiveForce session data here…"
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setSaved(false);
          }}
        />
        {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "8px 0 0" }}>{error}</p>}
        <div className="clindash-inline-form-actions" style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-primary" disabled={pending || !rawText.trim()} onClick={handleParse}>
            {pending ? "Reading your assessment…" : "Parse Assessment"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="forcelab-paste-preview">
        <div className="forcelab-paste-meta-panel">
          <div className="forcelab-form-section-title">Patient Metadata</div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pa-identifier">Identifier</label>
            <input className="input" id="pa-identifier" value={meta.identifier} onChange={(e) => setMeta((m) => ({ ...m, identifier: e.target.value }))} />
          </div>
          <div className="field" style={{ margin: "10px 0 0" }}>
            <label htmlFor="pa-date">Assessment date</label>
            <input className="input" id="pa-date" value={meta.assessmentDate} onChange={(e) => setMeta((m) => ({ ...m, assessmentDate: e.target.value }))} />
          </div>
          <div className="forcelab-inline-fields">
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="pa-weight">Weight</label>
              <input className="input" id="pa-weight" type="number" value={meta.weight} onChange={(e) => setMeta((m) => ({ ...m, weight: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="pa-weight-unit">Unit</label>
              <select
                className="input"
                id="pa-weight-unit"
                value={meta.weightUnit}
                onChange={(e) => setMeta((m) => ({ ...m, weightUnit: e.target.value }))}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
          <div className="forcelab-inline-fields">
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="pa-age">Age</label>
              <input className="input" id="pa-age" type="number" value={meta.age} onChange={(e) => setMeta((m) => ({ ...m, age: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="pa-sex">Sex</label>
              <select className="input" id="pa-sex" value={meta.sex} onChange={(e) => setMeta((m) => ({ ...m, sex: e.target.value }))}>
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="field" style={{ margin: "10px 0 0" }}>
            <label htmlFor="pa-dominant">Dominant side</label>
            <input
              className="input"
              id="pa-dominant"
              value={meta.dominantSide}
              onChange={(e) => setMeta((m) => ({ ...m, dominantSide: e.target.value }))}
            />
          </div>

          <div className="field" style={{ margin: "14px 0 0" }}>
            <label htmlFor="pa-patient">Link to Patient</label>
            <select
              className="input"
              id="pa-patient"
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                onPatientChange?.(e.target.value);
              }}
            >
              <option value="">Unlinked</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patientCode} — {p.condition}
                </option>
              ))}
            </select>
            {autoMatchedCode && patients.find((p) => p.id === patientId)?.patientCode === autoMatchedCode && (
              <p className="forcelab-automatch-note">Auto-matched to patient {autoMatchedCode}</p>
            )}
          </div>

          <div className="field" style={{ margin: "14px 0 0" }}>
            <label htmlFor="pa-notes">Notes</label>
            <textarea className="input" id="pa-notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: "vertical" }} />
          </div>
        </div>

        <div className="forcelab-paste-table-panel">
          <div className="forcelab-form-section-title">Muscle Groups</div>
          <div className="forcelab-patient-history-table-wrap">
            <table className="forcelab-patient-history-table">
              <thead>
                <tr>
                  <th>Muscle Group</th>
                  <th>Left Peak ({muscleGroups[0]?.unit ?? "lbs"})</th>
                  <th>Right Peak ({muscleGroups[0]?.unit ?? "lbs"})</th>
                  <th>LSI</th>
                  <th>Avg Force L</th>
                  <th>Avg Force R</th>
                  <th>FW Ratio L</th>
                  <th>FW Ratio R</th>
                </tr>
              </thead>
              <tbody>
                {muscleGroups.map((m, i) => {
                  const unrecognized = m.bodyRegion === "General";
                  const lowLsi = m.lsi != null && m.lsi < 80;
                  return (
                    <tr key={i} style={lowLsi ? { borderLeft: `3px solid ${FORCE_LAB_RED}` } : undefined}>
                      <td>
                        {m.muscleGroup}
                        {unrecognized && <div className="forcelab-unrecognized-note">Unrecognized — will be saved as entered</div>}
                      </td>
                      <td>{m.peakForceLeft ?? "—"}</td>
                      <td>{m.peakForceRight ?? "—"}</td>
                      <td style={{ color: lsiColor(m.lsi), fontWeight: 700 }}>{m.lsi != null ? `${m.lsi}%` : "—"}</td>
                      <td>{m.averageForceLeft ?? "—"}</td>
                      <td>{m.averageForceRight ?? "—"}</td>
                      <td>{m.forceWeightRatioLeft ?? "—"}</td>
                      <td>{m.forceWeightRatioRight ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="forcelab-row-count">{muscleGroups.length} muscle groups parsed</p>
        </div>
      </div>

      {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "10px 0 0" }}>{error}</p>}
      <div className="clindash-inline-form-actions" style={{ marginTop: 14 }}>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
          {pending ? "Saving…" : "Save Assessment"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={pending}>
          Clear
        </button>
      </div>
      <p className="forcelab-paste-disclaimer">Review all values before saving. Raw text is stored for reference.</p>
    </div>
  );
}
