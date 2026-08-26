"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  dischargePatient,
  getPatientDetail,
  type AvailableHEP,
  type DashboardSummary,
  type PatientDetail,
  type PatientListEntry,
} from "@/app/actions/clinician-dashboard";
import { getDashboardResearchFeedAction } from "@/app/actions/dashboard-research";
import type { LimbicAgentInsights } from "@/lib/limbic-agent-insights";
import type { Article } from "@/lib/types";
import { DailyBriefBar } from "./DailyBriefBar";
import { PatientPanel } from "./PatientPanel";
import { PatientWorkspace } from "./PatientWorkspace";
import { ResearchFeedPanel } from "./ResearchFeedPanel";
import { PracticeMetrics, ClinicProPlaceholder } from "./PracticeMetrics";
import { PreparePatientModal } from "./PreparePatientModal";

export interface ClinicianDashboardProps {
  greeting: string;
  summary: DashboardSummary;
  initialPatients: PatientListEntry[];
  availableHEPs: AvailableHEP[];
  limbicAgentInsights: LimbicAgentInsights;
  defaultResearchArticles: Article[];
  clinicianName: string;
  clinicianCredential: string;
  clinicianClinicName: string;
  clinicianEmail: string;
}

/** Client orchestrator for /pro/dashboard — owns which patient is selected and everything
 *  downstream of that (patient detail, the research feed's mode). `summary` and
 *  `initialPatients` are plain props, not local state: every mutation below calls
 *  router.refresh() after it resolves, which re-runs the page.tsx Server Component and
 *  flows fresh values back down through these same prop names — this component only needs
 *  its own state for things a server re-render can't know about (which patient is
 *  selected, that patient's full detail, the modal). */
export function ClinicianDashboard({
  greeting,
  summary,
  initialPatients,
  availableHEPs,
  limbicAgentInsights,
  defaultResearchArticles,
  clinicianName,
  clinicianCredential,
  clinicianClinicName,
  clinicianEmail,
}: ClinicianDashboardProps) {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  // The most recently *fetched* detail/research pair, plus which patient it's for —
  // render below only trusts it when detailFor still matches selectedPatientId, so
  // switching (or deselecting) a patient never needs its own setState call to "clear" the
  // old value first (see the effect below, whose only setState calls happen inside a
  // .then() after the fetch resolves, never synchronously in the effect body itself —
  // required by this repo's react-hooks/set-state-in-effect lint rule).
  const [fetchedDetail, setFetchedDetail] = useState<PatientDetail | null>(null);
  const [fetchedResearch, setFetchedResearch] = useState<Article[] | null>(null);
  const [detailFor, setDetailFor] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [dischargePending, startDischarge] = useTransition();
  const [prepareModalOpen, setPrepareModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedPatientId) return;
    let cancelled = false;
    Promise.all([getPatientDetail(selectedPatientId), getDashboardResearchFeedAction(selectedPatientId)]).then(
      ([detail, research]) => {
        if (cancelled) return;
        setFetchedDetail(detail);
        setFetchedResearch(research);
        setDetailFor(selectedPatientId);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId, refreshTick]);

  const detailIsCurrent = selectedPatientId !== null && detailFor === selectedPatientId;
  const patientDetail = detailIsCurrent ? fetchedDetail : null;
  const loadingDetail = selectedPatientId !== null && !detailIsCurrent;
  const researchArticles = detailIsCurrent && fetchedResearch ? fetchedResearch : defaultResearchArticles;

  const handleSelect = (id: string | null) => {
    setSelectedPatientId(id);
  };

  const handleChanged = () => {
    setRefreshTick((t) => t + 1);
    router.refresh();
  };

  const handleDischarge = () => {
    if (!selectedPatientId) return;
    startDischarge(async () => {
      const result = await dischargePatient(selectedPatientId);
      if (result.ok) {
        router.refresh();
        setRefreshTick((t) => t + 1);
      }
    });
  };

  const patientLabel = patientDetail ? `${patientDetail.bodyRegion} · ${patientDetail.condition}` : null;

  return (
    <>
      <DailyBriefBar summary={summary} />

      <div className="clindash-columns">
        <div className="clindash-col-patients">
          <PatientPanel patients={initialPatients} selectedPatientId={selectedPatientId} onSelect={handleSelect} />
        </div>

        <PatientWorkspace
          greeting={greeting}
          limbicAgentInsights={limbicAgentInsights}
          selectedPatient={patientDetail}
          loadingDetail={loadingDetail}
          availableHEPs={availableHEPs}
          onChanged={handleChanged}
          onDischarge={handleDischarge}
          onPrepareForPatient={() => setPrepareModalOpen(true)}
          dischargePending={dischargePending}
        />

        <div className="clindash-col-research">
          <ResearchFeedPanel articles={researchArticles} patientLabel={patientLabel} />
        </div>
      </div>

      <PracticeMetrics patients={initialPatients} />
      <ClinicProPlaceholder />

      {patientDetail && (
        <PreparePatientModal
          open={prepareModalOpen}
          patient={patientDetail}
          clinicianName={clinicianName}
          clinicianCredential={clinicianCredential}
          clinicianClinicName={clinicianClinicName}
          clinicianEmail={clinicianEmail}
          onClose={() => setPrepareModalOpen(false)}
        />
      )}
    </>
  );
}
