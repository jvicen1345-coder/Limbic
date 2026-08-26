import type { MutableRefObject } from "react";
import type { AvailableHEP, DashboardSummary, PatientDetail, PatientListEntry } from "@/app/actions/clinician-dashboard";
import { bodyRegionTagClass } from "@/lib/clinician-dashboard-types";
import { PreVisitBriefSection } from "./PreVisitBriefSection";
import { OutcomeMeasuresSection, type OutcomeMeasuresSectionHandle } from "./OutcomeMeasuresSection";
import { HEPSection } from "./HEPSection";
import { ClinicalNotesSection } from "./ClinicalNotesSection";
import { MorningRounds } from "./MorningRounds";
import { VisitLogBanner } from "./VisitLogBanner";
import { OutcomeMilestoneBanner } from "./OutcomeMilestoneBanner";
import { ConditionIntelligenceCard } from "./ConditionIntelligenceCard";
import { TreatmentIdeasCard } from "./TreatmentIdeasCard";
import { ClinicalAlertBanner } from "./ClinicalAlertBanner";

function ActiveWorkspace({
  patient,
  availableHEPs,
  onChanged,
  onDischarge,
  onPrepareForPatient,
  dischargePending,
  showVisitBanner,
  onVisitLogged,
  onVisitBannerDismiss,
  showMilestoneBanner,
  onDismissMilestone,
  initiallyOpenOutcomes,
  outcomeActionsRef,
  redFlagAlerts,
  onDismissRedFlag,
}: {
  patient: PatientDetail;
  availableHEPs: AvailableHEP[];
  onChanged: () => void;
  onDischarge: () => void;
  onPrepareForPatient: () => void;
  dischargePending: boolean;
  showVisitBanner: boolean;
  onVisitLogged: () => void;
  onVisitBannerDismiss: () => void;
  showMilestoneBanner: boolean;
  onDismissMilestone: () => void;
  initiallyOpenOutcomes: boolean;
  outcomeActionsRef: MutableRefObject<OutcomeMeasuresSectionHandle | null>;
  redFlagAlerts: { id: string; description: string }[];
  onDismissRedFlag: (alertId: string) => void;
}) {
  const progressPercent = patient.totalVisits > 0 ? Math.min(100, Math.round((patient.visitCount / patient.totalVisits) * 100)) : 0;

  return (
    <div>
      <ClinicalAlertBanner alerts={redFlagAlerts} onDismiss={onDismissRedFlag} />

      {showVisitBanner && (
        <VisitLogBanner
          key={patient.id}
          patientId={patient.id}
          patientCode={patient.patientCode}
          onLogged={onVisitLogged}
          onDismiss={onVisitBannerDismiss}
        />
      )}

      <div className="clindash-patient-header">
        <div>
          <div className="clindash-patient-header-code">{patient.patientCode}</div>
          <div className="clindash-patient-header-condition">{patient.condition}</div>
          <div className="clindash-patient-header-pills">
            <span className={`tag ${bodyRegionTagClass(patient.bodyRegion)}`}>{patient.bodyRegion}</span>
            <span className="tag tag-outline">{patient.specialty}</span>
            <span className={`clindash-status-pill clindash-status-pill--${patient.status}`}>
              {patient.status === "active" ? "Active" : "Discharged"}
            </span>
            {patient.dueForReassessment && <span className="tag tag-accent-2">Due for reassessment</span>}
          </div>
        </div>
        <div className="clindash-patient-header-actions">
          <button type="button" className="btn btn-primary" onClick={onPrepareForPatient} disabled={patient.status !== "active"}>
            Prepare for Patient
          </button>
          {patient.status === "active" && (
            <button type="button" className="btn clindash-discharge-btn" onClick={onDischarge} disabled={dischargePending}>
              {dischargePending ? "Discharging…" : "Discharge"}
            </button>
          )}
        </div>
      </div>

      <ConditionIntelligenceCard condition={patient.condition} outcomeActionsRef={outcomeActionsRef} />

      <PreVisitBriefSection patient={patient} />

      <TreatmentIdeasCard patientId={patient.id} />

      <div className="clindash-section">
        <div className="clindash-visit-progress-label">
          Visit {patient.visitCount} of {patient.totalVisits}
        </div>
        <div className="clindash-progress-bar">
          <div className="clindash-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="clindash-visit-dates">
          <span>Started {new Date(patient.startDate).toLocaleDateString()}</span>
          {patient.lastSeen && <span>Last seen {new Date(patient.lastSeen).toLocaleDateString()}</span>}
          {patient.nextVisit && <span>Next visit {new Date(patient.nextVisit).toLocaleDateString()}</span>}
        </div>
      </div>

      {showMilestoneBanner && (
        <OutcomeMilestoneBanner
          visitCount={patient.visitCount}
          onRecordNow={() => outcomeActionsRef.current?.openAndScroll()}
          onDismiss={onDismissMilestone}
        />
      )}

      <OutcomeMeasuresSection
        patient={patient}
        onChanged={onChanged}
        initiallyOpen={initiallyOpenOutcomes}
        actionsRef={outcomeActionsRef}
      />
      <HEPSection patient={patient} availableHEPs={availableHEPs} onChanged={onChanged} />
      <ClinicalNotesSection patient={patient} onChanged={onChanged} />
    </div>
  );
}

/** Center column of /pro/dashboard — either Morning Rounds (no patient selected) or the
 *  full active-patient workspace, switched purely on whether `selectedPatient` is
 *  non-null. */
export function PatientWorkspace({
  selectedPatient,
  loadingDetail,
  availableHEPs,
  onChanged,
  onDischarge,
  onPrepareForPatient,
  dischargePending,
  todaysPatients,
  outcomeReminderPatients,
  allPatients,
  summary,
  onStartSession,
  onRecordOutcomes,
  onSelectPatient,
  showVisitBanner,
  onVisitLogged,
  onVisitBannerDismiss,
  showMilestoneBanner,
  onDismissMilestone,
  initiallyOpenOutcomes,
  outcomeActionsRef,
  redFlagAlerts,
  onDismissRedFlag,
}: {
  selectedPatient: PatientDetail | null;
  loadingDetail: boolean;
  availableHEPs: AvailableHEP[];
  onChanged: () => void;
  onDischarge: () => void;
  onPrepareForPatient: () => void;
  dischargePending: boolean;
  todaysPatients: PatientListEntry[];
  outcomeReminderPatients: PatientListEntry[];
  allPatients: PatientListEntry[];
  summary: DashboardSummary;
  onStartSession: (patientId: string) => void;
  onRecordOutcomes: (patientId: string) => void;
  onSelectPatient: (patientId: string) => void;
  showVisitBanner: boolean;
  onVisitLogged: () => void;
  onVisitBannerDismiss: () => void;
  showMilestoneBanner: boolean;
  onDismissMilestone: () => void;
  initiallyOpenOutcomes: boolean;
  outcomeActionsRef: MutableRefObject<OutcomeMeasuresSectionHandle | null>;
  redFlagAlerts: { id: string; description: string }[];
  onDismissRedFlag: (alertId: string) => void;
}) {
  return (
    <div className="card elev-sm" style={{ minHeight: 300 }}>
      {selectedPatient ? (
        loadingDetail ? (
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Loading patient…</p>
        ) : (
          <ActiveWorkspace
            patient={selectedPatient}
            availableHEPs={availableHEPs}
            onChanged={onChanged}
            onDischarge={onDischarge}
            onPrepareForPatient={onPrepareForPatient}
            dischargePending={dischargePending}
            showVisitBanner={showVisitBanner}
            onVisitLogged={onVisitLogged}
            onVisitBannerDismiss={onVisitBannerDismiss}
            showMilestoneBanner={showMilestoneBanner}
            onDismissMilestone={onDismissMilestone}
            initiallyOpenOutcomes={initiallyOpenOutcomes}
            outcomeActionsRef={outcomeActionsRef}
            redFlagAlerts={redFlagAlerts}
            onDismissRedFlag={onDismissRedFlag}
          />
        )
      ) : (
        <MorningRounds
          todaysPatients={todaysPatients}
          outcomeReminderPatients={outcomeReminderPatients}
          allPatients={allPatients}
          summary={summary}
          onStartSession={onStartSession}
          onRecordOutcomes={onRecordOutcomes}
          onSelectPatient={onSelectPatient}
        />
      )}
    </div>
  );
}
