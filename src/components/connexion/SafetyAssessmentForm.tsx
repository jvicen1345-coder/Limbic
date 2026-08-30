"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  SAFETY_SCORE_DOMAINS,
  RISK_SCALE,
  EQUIPMENT_OPTIONS,
  EQUIPMENT_PRIORITIES,
  CAREGIVER_SKILLS,
  CRITICAL_FINDING_OPTIONS,
  FOLLOW_UP_OPTIONS,
  computeSafetyScoreTotals,
  domainMaxScore,
  type EquipmentRecommendation,
  type CaregiverSkillStatus,
} from "@/lib/connexion-safety-score";
import {
  createSafetyAssessment,
  updateSafetyAssessment,
  type SafetyAssessmentDetail,
  type SafetyAssessmentInput,
} from "@/app/actions/connexion-safety-score";

interface Props {
  mode: "create" | "edit";
  id?: string;
  initial?: SafetyAssessmentDetail;
  /** Pre-fills client info + links the created assessment back to a lead, when arriving from
   *  a "Start Safety Score" click on /admin/connexion-visits (see VisitRequestsAdminList). */
  visitRequestId?: string | null;
  initialClientName?: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The Connexion Safety Score's fillable form — every item from SAFETY_SCORE_DOMAINS scored
 *  0-4, plus the equipment/caregiver/priority-action/summary sections from the paper form.
 *  isSiteAdmin-gated pages (/admin/connexion-safety-score/new and .../[id]) are this
 *  component's only callers; it does no authorization itself, matching EditPatientForm and
 *  every other form-plus-server-action pair in this app. */
export function SafetyAssessmentForm({ mode, id, initial, visitRequestId, initialClientName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState(initial?.clientName ?? initialClientName ?? "");
  const [clientAddress, setClientAddress] = useState(initial?.clientAddress ?? "");
  const [assessmentDate, setAssessmentDate] = useState(initial?.assessmentDate ?? todayIso());
  const [itemScores, setItemScores] = useState<Record<string, number>>(initial?.itemScores ?? {});
  const [criticalFindings, setCriticalFindings] = useState<string[]>(initial?.criticalFindings ?? []);
  const [criticalFindingsOther, setCriticalFindingsOther] = useState(initial?.criticalFindingsOther ?? "");
  const [equipment, setEquipment] = useState<EquipmentRecommendation[]>(initial?.equipment ?? []);
  const [caregiverSkills, setCaregiverSkills] = useState<Record<string, CaregiverSkillStatus>>(initial?.caregiverSkills ?? {});
  const [priorityActionsUrgent, setPriorityActionsUrgent] = useState(initial?.priorityActionsUrgent ?? "");
  const [priorityActionsSoon, setPriorityActionsSoon] = useState(initial?.priorityActionsSoon ?? "");
  const [priorityActionsMonitor, setPriorityActionsMonitor] = useState(initial?.priorityActionsMonitor ?? "");
  const [biggestRisk, setBiggestRisk] = useState(initial?.biggestRisk ?? "");
  const [mostImportantChange, setMostImportantChange] = useState(initial?.mostImportantChange ?? "");
  const [equipmentRecommendedNote, setEquipmentRecommendedNote] = useState(initial?.equipmentRecommendedNote ?? "");
  const [caregiverTrainingNote, setCaregiverTrainingNote] = useState(initial?.caregiverTrainingNote ?? "");
  const [followUp, setFollowUp] = useState(initial?.followUp ?? "");
  const [followUpOther, setFollowUpOther] = useState(initial?.followUpOther ?? "");
  const [ptRecommendation, setPtRecommendation] = useState(initial?.ptRecommendation ?? "");

  const totals = computeSafetyScoreTotals(itemScores);

  const setScore = (key: string, value: number) => setItemScores((prev) => ({ ...prev, [key]: value }));

  const toggleCriticalFinding = (label: string) => {
    setCriticalFindings((prev) => (prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]));
  };

  const addEquipmentRow = () => setEquipment((prev) => [...prev, { equipment: EQUIPMENT_OPTIONS[0], location: "", priority: "Routine" }]);
  const updateEquipmentRow = (idx: number, patch: Partial<EquipmentRecommendation>) =>
    setEquipment((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  const removeEquipmentRow = (idx: number) => setEquipment((prev) => prev.filter((_, i) => i !== idx));

  const setCaregiverSkill = (key: string, status: CaregiverSkillStatus) =>
    setCaregiverSkills((prev) => ({ ...prev, [key]: prev[key] === status ? undefined : status }) as Record<string, CaregiverSkillStatus>);

  const handleSave = () => {
    setError(null);
    if (!clientName.trim()) {
      setError("Client name is required.");
      return;
    }
    const input: SafetyAssessmentInput = {
      clientName,
      clientAddress,
      assessmentDate,
      visitRequestId: initial?.visitRequestId ?? visitRequestId ?? null,
      itemScores,
      criticalFindings,
      criticalFindingsOther,
      equipment,
      caregiverSkills,
      priorityActionsUrgent,
      priorityActionsSoon,
      priorityActionsMonitor,
      biggestRisk,
      mostImportantChange,
      equipmentRecommendedNote,
      caregiverTrainingNote,
      followUp,
      followUpOther,
      ptRecommendation,
    };
    startTransition(async () => {
      const result = mode === "create" ? await createSafetyAssessment(input) : await updateSafetyAssessment(id!, input);
      if (!result.ok || !result.id) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push(`/admin/connexion-safety-score/${result.id}`);
      router.refresh();
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card elev-sm" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Client & Visit
        </div>
        <div className="clindash-inline-form-row">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="csa-client-name">Client name</label>
            <input className="input" id="csa-client-name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="csa-date">Assessment date</label>
            <input className="input" id="csa-date" type="date" value={assessmentDate} onChange={(e) => setAssessmentDate(e.target.value)} />
          </div>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-address">Address</label>
          <input className="input" id="csa-address" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
        </div>
      </div>

      {SAFETY_SCORE_DOMAINS.map((domain) => {
        const domainScore = domain.key === "environmental" ? totals.environmental : domain.key === "mobility" ? totals.mobility : totals.fallRisk;
        return (
          <div className="card elev-sm" key={domain.key}>
            <div className="connexion-assess-domain-header">
              <div className="card-kicker" style={{ margin: 0 }}>
                {domain.name}
              </div>
              <span className="connexion-assess-domain-score">
                {domainScore} / {domainMaxScore(domain)}
              </span>
            </div>
            {domain.sections.map((section) => (
              <div key={section.key} style={{ marginTop: 14 }}>
                {section.label && <div className="connexion-assess-section-label">{section.label}</div>}
                {section.items.map((item) => (
                  <div className="connexion-assess-item-row" key={item.key}>
                    <span className="connexion-assess-item-label">{item.label}</span>
                    <div className="connexion-assess-score-buttons" role="group" aria-label={item.label}>
                      {RISK_SCALE.map((r) => (
                        <button
                          type="button"
                          key={r.score}
                          className={`connexion-assess-score-btn${(itemScores[item.key] ?? 0) === r.score ? " active" : ""}`}
                          onClick={() => setScore(item.key, r.score)}
                          title={`${r.label} — ${r.meaning}`}
                        >
                          {r.score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}

      <div className="connexion-score-output-card">
        <div className="connexion-score-output-title">Total Risk Score</div>
        <div className="connexion-score-circle connexion-score-circle--live" aria-hidden="true">
          {totals.total}
        </div>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>out of 208</p>
        <span className="connexion-badge-soon" style={{ fontSize: 12 }}>
          {totals.riskLevel} Risk — {totals.riskAction}
        </span>
      </div>

      <div className="card elev-sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Important Safety Override
        </div>
        <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0 }}>
          Regardless of the total score, any critical individual finding should be addressed immediately.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CRITICAL_FINDING_OPTIONS.map((f) => (
            <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={criticalFindings.includes(f)} onChange={() => toggleCriticalFinding(f)} />
              {f}
            </label>
          ))}
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-critical-other">Other</label>
          <input className="input" id="csa-critical-other" value={criticalFindingsOther} onChange={(e) => setCriticalFindingsOther(e.target.value)} />
        </div>
      </div>

      <div className="card elev-sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Equipment Recommendations
        </div>
        {equipment.map((row, idx) => (
          <div className="connexion-assess-equipment-row" key={idx}>
            <select className="input" value={row.equipment} onChange={(e) => updateEquipmentRow(idx, { equipment: e.target.value })}>
              {EQUIPMENT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Location"
              value={row.location}
              onChange={(e) => updateEquipmentRow(idx, { location: e.target.value })}
            />
            <select className="input" value={row.priority} onChange={(e) => updateEquipmentRow(idx, { priority: e.target.value as EquipmentRecommendation["priority"] })}>
              {EQUIPMENT_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-ghost" onClick={() => removeEquipmentRow(idx)} aria-label="Remove equipment row">
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" style={{ alignSelf: "flex-start" }} onClick={addEquipmentRow}>
          + Add Equipment
        </button>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-pt-rec">PT Recommendation</label>
          <textarea className="input" id="csa-pt-rec" value={ptRecommendation} onChange={(e) => setPtRecommendation(e.target.value)} style={{ resize: "vertical" }} />
        </div>
      </div>

      <div className="card elev-sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Caregiver Safety Check
        </div>
        {CAREGIVER_SKILLS.map((skill) => (
          <div className="connexion-assess-item-row" key={skill.key}>
            <span className="connexion-assess-item-label">{skill.label}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={`connexion-assess-toggle-btn${caregiverSkills[skill.key] === "demonstrated" ? " active" : ""}`}
                onClick={() => setCaregiverSkill(skill.key, "demonstrated")}
              >
                Demonstrated
              </button>
              <button
                type="button"
                className={`connexion-assess-toggle-btn${caregiverSkills[skill.key] === "needsTraining" ? " active" : ""}`}
                onClick={() => setCaregiverSkill(skill.key, "needsTraining")}
              >
                Needs Training
              </button>
            </div>
          </div>
        ))}
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-caregiver-note">Caregiver training provided</label>
          <textarea className="input" id="csa-caregiver-note" value={caregiverTrainingNote} onChange={(e) => setCaregiverTrainingNote(e.target.value)} style={{ resize: "vertical" }} />
        </div>
      </div>

      <div className="card elev-sm" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Priority Action Plan
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-priority-urgent">Priority 1 — Address Immediately</label>
          <textarea className="input" id="csa-priority-urgent" value={priorityActionsUrgent} onChange={(e) => setPriorityActionsUrgent(e.target.value)} style={{ resize: "vertical" }} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-priority-soon">Priority 2 — Address Soon</label>
          <textarea className="input" id="csa-priority-soon" value={priorityActionsSoon} onChange={(e) => setPriorityActionsSoon(e.target.value)} style={{ resize: "vertical" }} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-priority-monitor">Priority 3 — Consider / Monitor</label>
          <textarea className="input" id="csa-priority-monitor" value={priorityActionsMonitor} onChange={(e) => setPriorityActionsMonitor(e.target.value)} style={{ resize: "vertical" }} />
        </div>
      </div>

      <div className="card elev-sm" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Connexion Safety Summary
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-biggest-risk">The biggest risk identified today is</label>
          <input className="input" id="csa-biggest-risk" value={biggestRisk} onChange={(e) => setBiggestRisk(e.target.value)} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-important-change">The single most important change to make</label>
          <input className="input" id="csa-important-change" value={mostImportantChange} onChange={(e) => setMostImportantChange(e.target.value)} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-equipment-note">Equipment recommended</label>
          <input className="input" id="csa-equipment-note" value={equipmentRecommendedNote} onChange={(e) => setEquipmentRecommendedNote(e.target.value)} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="csa-followup">Follow-up recommended</label>
          <select className="input" id="csa-followup" value={followUp} onChange={(e) => setFollowUp(e.target.value)}>
            <option value="">Select…</option>
            {FOLLOW_UP_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {followUp === "other" && (
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="csa-followup-other">Follow-up detail</label>
            <input className="input" id="csa-followup-other" value={followUpOther} onChange={(e) => setFollowUpOther(e.target.value)} />
          </div>
        )}
      </div>

      {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
          {pending ? "Saving…" : mode === "create" ? "Save Assessment" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
