import Link from "next/link";
import { LimbicAgentCard } from "@/components/LimbicAgentCard";
import { FileTextIcon, CalendarIcon, BandageIcon } from "@/components/icons";
import type { LimbicAgentInsights } from "@/lib/limbic-agent-insights";
import type { AvailableHEP, PatientDetail } from "@/app/actions/clinician-dashboard";
import { bodyRegionTagClass } from "@/lib/clinician-dashboard-types";
import { PreVisitBriefSection } from "./PreVisitBriefSection";
import { OutcomeMeasuresSection } from "./OutcomeMeasuresSection";
import { HEPSection } from "./HEPSection";
import { ClinicalNotesSection } from "./ClinicalNotesSection";

const QUICK_LINKS = [
  { href: "/pro/documentation", label: "Documentation", icon: FileTextIcon },
  { href: "/pro/ce-tracker", label: "CE Tracker", icon: CalendarIcon },
  { href: "/hep", label: "Home Exercise Programs", icon: BandageIcon },
];

function DefaultWorkspace({ greeting, limbicAgentInsights }: { greeting: string; limbicAgentInsights: LimbicAgentInsights }) {
  return (
    <div>
      <h1 className="clindash-workspace-greeting">{greeting}</h1>
      <p className="clindash-workspace-sub">Select a patient from your caseload, or add a new one, to get started.</p>

      <LimbicAgentCard insights={limbicAgentInsights} isPro />

      <div className="clindash-quick-links">
        {QUICK_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="btn btn-secondary">
            <l.icon size={14} />
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ActiveWorkspace({
  patient,
  availableHEPs,
  onChanged,
  onDischarge,
  onPrepareForPatient,
  dischargePending,
}: {
  patient: PatientDetail;
  availableHEPs: AvailableHEP[];
  onChanged: () => void;
  onDischarge: () => void;
  onPrepareForPatient: () => void;
  dischargePending: boolean;
}) {
  const progressPercent = patient.totalVisits > 0 ? Math.min(100, Math.round((patient.visitCount / patient.totalVisits) * 100)) : 0;

  return (
    <div>
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

      <PreVisitBriefSection patient={patient} />

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

      <OutcomeMeasuresSection patient={patient} onChanged={onChanged} />
      <HEPSection patient={patient} availableHEPs={availableHEPs} onChanged={onChanged} />
      <ClinicalNotesSection patient={patient} onChanged={onChanged} />
    </div>
  );
}

/** Center column of /pro/dashboard — either the default "no patient selected" state (the
 *  same Limbic Agent insight card as the home feed, plus quick links into the rest of
 *  LimbicPRO) or the full active-patient workspace, switched purely on whether
 *  `selectedPatient` is non-null. */
export function PatientWorkspace({
  greeting,
  limbicAgentInsights,
  selectedPatient,
  loadingDetail,
  availableHEPs,
  onChanged,
  onDischarge,
  onPrepareForPatient,
  dischargePending,
}: {
  greeting: string;
  limbicAgentInsights: LimbicAgentInsights;
  selectedPatient: PatientDetail | null;
  loadingDetail: boolean;
  availableHEPs: AvailableHEP[];
  onChanged: () => void;
  onDischarge: () => void;
  onPrepareForPatient: () => void;
  dischargePending: boolean;
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
          />
        )
      ) : (
        <DefaultWorkspace greeting={greeting} limbicAgentInsights={limbicAgentInsights} />
      )}
    </div>
  );
}
