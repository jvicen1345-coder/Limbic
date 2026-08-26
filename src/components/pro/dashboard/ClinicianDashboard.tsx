"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  checkRedFlags,
  dismissRedFlagAlert,
  getPatientDetail,
  hasLoggedVisitToday,
  type AvailableHEP,
  type DashboardSummary,
  type EpisodeLengthStats,
  type PatientDetail,
  type PatientListEntry,
  type PeerComparisonBenchmark,
  type ReferralSourceBreakdownEntry,
  type WeeklyResearchDigest,
} from "@/app/actions/clinician-dashboard";
import { getDashboardResearchFeedAction } from "@/app/actions/dashboard-research";
import type { Article } from "@/lib/types";
import { DailyBriefBar } from "./DailyBriefBar";
import { PatientPanel } from "./PatientPanel";
import { PatientWorkspace } from "./PatientWorkspace";
import { ResearchFeedPanel } from "./ResearchFeedPanel";
import { PracticeMetrics } from "./PracticeMetrics";
import { PreparePatientModal } from "./PreparePatientModal";
import { DischargeModal } from "./DischargeModal";
import { TeamOverview } from "./TeamOverview";
import type { OutcomeMeasuresSectionHandle } from "./OutcomeMeasuresSection";

export interface ClinicianDashboardProps {
  summary: DashboardSummary;
  initialPatients: PatientListEntry[];
  availableHEPs: AvailableHEP[];
  defaultResearchArticles: Article[];
  todaysPatients: PatientListEntry[];
  outcomeReminderPatients: PatientListEntry[];
  episodeLengthStats: EpisodeLengthStats;
  referralBreakdown: ReferralSourceBreakdownEntry[];
  weeklyDigest: WeeklyResearchDigest;
  peerBenchmarks: PeerComparisonBenchmark[];
  clinicianName: string;
  clinicianCredential: string;
  clinicianClinicName: string;
  clinicianEmail: string;
  /** Clinic PRO — null for a solo clinician with no active clinic membership. Non-null and
   *  isAdmin false for an ordinary team member (see the spec's "patient panel shows only
   *  patients assigned to this clinician — filtered by userId... daily brief bar adds a
   *  fifth tile" — both already true of the props this component already receives, so a
   *  non-admin member needs nothing else here beyond clinicPatientsToday below). Non-null
   *  and isAdmin true is the only case that adds the tab bar/Team Overview tab. */
  isClinicAdmin: boolean;
  clinicPatientsToday: number | null;
}

/** Client orchestrator for /pro/dashboard — owns which patient is selected and everything
 *  downstream of that (patient detail, the research feed's mode, the visit-log and
 *  outcome-milestone banners). `summary`, `initialPatients`, `todaysPatients`, and
 *  `outcomeReminderPatients` are plain props, not local state: every mutation below calls
 *  router.refresh() after it resolves, which re-runs the page.tsx Server Component and
 *  flows fresh values back down through these same prop names — this component only needs
 *  its own state for things a server re-render can't know about (which patient is
 *  selected, that patient's full detail, per-opening banner dismissal). */
export function ClinicianDashboard({
  summary,
  initialPatients,
  availableHEPs,
  defaultResearchArticles,
  todaysPatients,
  outcomeReminderPatients,
  episodeLengthStats,
  referralBreakdown,
  weeklyDigest,
  peerBenchmarks,
  clinicianName,
  clinicianCredential,
  clinicianClinicName,
  clinicianEmail,
  isClinicAdmin,
  clinicPatientsToday,
}: ClinicianDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialized once from ?tab=team (see the sidebar's "Team Dashboard" link in
  // AppShell.tsx) — a plain useState initializer, not an effect, so switching tabs
  // afterward is ordinary client state and never re-reads the URL.
  const [activeTab, setActiveTab] = useState<"patients" | "team">(() => (searchParams.get("tab") === "team" ? "team" : "patients"));
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  // The most recently *fetched* detail/research/visit-logged trio, plus which patient it's
  // for — render below only trusts it when detailFor still matches selectedPatientId, so
  // switching (or deselecting) a patient never needs its own setState call to "clear" the
  // old value first (see the effect below, whose only setState calls happen inside a
  // .then() after the fetch resolves, never synchronously in the effect body itself —
  // required by this repo's react-hooks/set-state-in-effect lint rule).
  const [fetchedDetail, setFetchedDetail] = useState<PatientDetail | null>(null);
  const [fetchedResearch, setFetchedResearch] = useState<Article[] | null>(null);
  const [visitAlreadyLoggedToday, setVisitAlreadyLoggedToday] = useState(false);
  const [redFlagAlerts, setRedFlagAlerts] = useState<{ id: string; description: string }[]>([]);
  const [detailFor, setDetailFor] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [prepareModalOpen, setPrepareModalOpen] = useState(false);
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);

  // Per-opening dismissal tracking for the visit-log and outcome-milestone banners — reset
  // to null (i.e. "not yet handled") every time selectedPatientId changes at all, including
  // deselecting and reselecting the same patient, since a card click always toggles through
  // null in between (see PatientPanel.tsx) and both banners are specced to "reappear next
  // time the patient is opened." Adjusted during render on the tracked-value pattern above,
  // not inside an effect.
  const [trackedSelectedId, setTrackedSelectedId] = useState(selectedPatientId);
  const [visitBannerHandledFor, setVisitBannerHandledFor] = useState<string | null>(null);
  const [milestoneDismissedFor, setMilestoneDismissedFor] = useState<string | null>(null);
  if (selectedPatientId !== trackedSelectedId) {
    setTrackedSelectedId(selectedPatientId);
    setVisitBannerHandledFor(null);
    setMilestoneDismissedFor(null);
  }

  // Set (and explicitly cleared by every other selection path) only by handleRecordOutcomes
  // below — marks "the next time this specific patient's detail loads, mount the Outcome
  // Measures form already open." See OutcomeMeasuresSection's own initiallyOpen prop for why
  // this only needs to matter once, at mount.
  const [pendingOutcomeOpenFor, setPendingOutcomeOpenFor] = useState<string | null>(null);
  const outcomeActionsRef = useRef<OutcomeMeasuresSectionHandle | null>(null);

  useEffect(() => {
    if (!selectedPatientId) return;
    let cancelled = false;
    Promise.all([
      getPatientDetail(selectedPatientId),
      getDashboardResearchFeedAction(selectedPatientId),
      hasLoggedVisitToday(selectedPatientId),
      // Runs on every open and every onChanged-triggered refetch (e.g. after saving an
      // outcome) — exactly the "after any outcome entry is saved or a patient record is
      // opened" trigger the Red Flag Monitor spec calls for, without a separate effect.
      checkRedFlags(selectedPatientId),
    ]).then(([detail, research, loggedToday, redFlags]) => {
      if (cancelled) return;
      setFetchedDetail(detail);
      setFetchedResearch(research);
      setVisitAlreadyLoggedToday(loggedToday);
      setRedFlagAlerts(redFlags.ok ? redFlags.alerts : []);
      setDetailFor(selectedPatientId);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId, refreshTick]);

  const detailIsCurrent = selectedPatientId !== null && detailFor === selectedPatientId;
  const patientDetail = detailIsCurrent ? fetchedDetail : null;
  const loadingDetail = selectedPatientId !== null && !detailIsCurrent;
  const researchArticles = detailIsCurrent && fetchedResearch ? fetchedResearch : defaultResearchArticles;
  const initiallyOpenOutcomes = detailIsCurrent && pendingOutcomeOpenFor === selectedPatientId;
  const showVisitBanner = detailIsCurrent && !visitAlreadyLoggedToday && visitBannerHandledFor !== selectedPatientId;
  const isMilestonePatient = patientDetail != null && outcomeReminderPatients.some((p) => p.id === patientDetail.id);
  const showMilestoneBanner = detailIsCurrent && isMilestonePatient && milestoneDismissedFor !== selectedPatientId;
  const activeRedFlagAlerts = detailIsCurrent ? redFlagAlerts : [];

  const handleSelect = (id: string | null) => {
    setPendingOutcomeOpenFor(null);
    setSelectedPatientId(id);
  };

  const handleStartSession = (patientId: string) => {
    setPendingOutcomeOpenFor(null);
    setSelectedPatientId(patientId);
  };

  const handleRecordOutcomes = (patientId: string) => {
    setPendingOutcomeOpenFor(patientId);
    setSelectedPatientId(patientId);
  };

  const handleChanged = () => {
    setRefreshTick((t) => t + 1);
    router.refresh();
  };

  const handleDismissRedFlag = (alertId: string) => {
    setRedFlagAlerts((alerts) => alerts.filter((a) => a.id !== alertId));
    void dismissRedFlagAlert(alertId);
  };

  const handlePatientDischarged = () => {
    router.refresh();
    setRefreshTick((t) => t + 1);
  };

  const patientLabel = patientDetail ? `${patientDetail.bodyRegion} · ${patientDetail.condition}` : null;

  return (
    <>
      <DailyBriefBar summary={summary} clinicPatientsToday={clinicPatientsToday} />

      <div className="clindash-columns">
        <div className="clindash-col-patients">
          <PatientPanel
            patients={initialPatients}
            selectedPatientId={selectedPatientId}
            onSelect={handleSelect}
            outcomeReminderIds={new Set(outcomeReminderPatients.map((p) => p.id))}
          />
        </div>

        <div className="clindash-col-workspace">
          {isClinicAdmin && (
            <div className="clindash-tab-bar">
              <button type="button" className={`clindash-tab ${activeTab === "patients" ? "clindash-tab--active" : ""}`} onClick={() => setActiveTab("patients")}>
                My Patients
              </button>
              <button type="button" className={`clindash-tab ${activeTab === "team" ? "clindash-tab--active" : ""}`} onClick={() => setActiveTab("team")}>
                Team Overview
              </button>
            </div>
          )}

          {isClinicAdmin && activeTab === "team" ? (
            <TeamOverview />
          ) : (
            <PatientWorkspace
              selectedPatient={patientDetail}
              loadingDetail={loadingDetail}
              availableHEPs={availableHEPs}
              onChanged={handleChanged}
              onOpenDischargeModal={() => setDischargeModalOpen(true)}
              onPrepareForPatient={() => setPrepareModalOpen(true)}
              todaysPatients={todaysPatients}
              outcomeReminderPatients={outcomeReminderPatients}
              allPatients={initialPatients}
              summary={summary}
              onStartSession={handleStartSession}
              onRecordOutcomes={handleRecordOutcomes}
              onSelectPatient={handleSelect}
              showVisitBanner={showVisitBanner}
              onVisitLogged={handleChanged}
              onVisitBannerDismiss={() => setVisitBannerHandledFor(selectedPatientId)}
              showMilestoneBanner={showMilestoneBanner}
              onDismissMilestone={() => setMilestoneDismissedFor(selectedPatientId)}
              initiallyOpenOutcomes={initiallyOpenOutcomes}
              outcomeActionsRef={outcomeActionsRef}
              redFlagAlerts={activeRedFlagAlerts}
              onDismissRedFlag={handleDismissRedFlag}
            />
          )}
        </div>

        <div className="clindash-col-research">
          <ResearchFeedPanel articles={researchArticles} patientLabel={patientLabel} weeklyDigest={weeklyDigest} />
        </div>
      </div>

      <PracticeMetrics
        patients={initialPatients}
        episodeLengthStats={episodeLengthStats}
        referralBreakdown={referralBreakdown}
        peerBenchmarks={peerBenchmarks}
      />

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

      {selectedPatientId && (
        <DischargeModal
          open={dischargeModalOpen}
          patientId={selectedPatientId}
          onClose={() => setDischargeModalOpen(false)}
          onDischarged={handlePatientDischarged}
        />
      )}
    </>
  );
}
