"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StrengthProfileEntry, ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";
import { ForceLabEntryForm } from "./ForceLabEntryForm";
import { ForceLabImportPanel } from "./ForceLabImportPanel";
import { PasteAssessmentPanel } from "./PasteAssessmentPanel";
import { PastResultsSection } from "./PastResultsSection";
import { SessionDetailView } from "./SessionDetailView";
import { StrengthProfilePanel } from "./StrengthProfilePanel";
import { ForceLabTrendChart } from "./ForceLabTrendChart";
import { bodyRegionForMuscle } from "@/lib/force-lab-muscles";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import type { ForceLabSession } from "@/generated/prisma/client";
import type { ForceLabPrefill } from "./ForceLabEntryForm";

type CenterMode = "manual" | "import" | "paste" | "view";

function lsiPillColor(lsi: number): string {
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Client orchestrator for /pro/force-lab — same "owns the interactive state, server page
 *  only does the initial fetch" split as ClinicianDashboard.tsx. `sessions` starts from the
 *  server-fetched prop but is then owned locally (spliced on every create/delete/link)
 *  rather than re-derived from a refreshed prop, since every mutation already hands back
 *  the exact row that changed — see the same reasoning in each handler below. */
export function ForceLabWorkspace({
  initialSessions,
  patients,
  forceUnit,
  initialPatientId,
  initialSessionId,
  initialCompareAssessmentId,
}: {
  initialSessions: ForceLabSession[];
  patients: PatientListEntry[];
  forceUnit: string;
  initialPatientId: string | null;
  /** "View" on the patient session page's history table (see
   *  app/pro/force-lab/patient/[patientCode]/page.tsx's own `?session=` query param) —
   *  opens straight to that session's read-only view instead of the blank Manual Entry
   *  tab. */
  initialSessionId?: string | null;
  /** "Compare" on the patient session page's Full Assessments cards (its own
   *  `?compareAssessment=` query param) — arms Past Results' comparison with this
   *  assessment already picked as the first side. */
  initialCompareAssessmentId?: string | null;
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const initialSession = initialSessionId ? initialSessions.find((s) => s.id === initialSessionId) : undefined;
  const [mode, setMode] = useState<CenterMode>(initialSession ? "view" : "manual");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialSession?.patientId ?? initialPatientId);
  const [lastLoadedMuscleGroup, setLastLoadedMuscleGroup] = useState<string | null>(initialSession?.muscleGroup ?? null);
  const [importPrefill, setImportPrefill] = useState<ForceLabPrefill | null>(null);
  const [importError, setImportError] = useState(false);
  // Bumped on every assessment save so the sibling Past Results section (which owns its own
  // self-fetched assessment list, separate from this workspace's `sessions` state) knows to
  // refetch — router.refresh() alone only re-supplies this page's server-fetched props, it
  // doesn't re-run a client component's own mount-effect fetch.
  const [assessmentsVersion, setAssessmentsVersion] = useState(0);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  const mostRecentSession =
    sessions.length === 0
      ? null
      : sessions.slice().sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())[0];

  // Both derived straight from the locally-owned `sessions` array rather than a separate
  // server round trip keyed on [selectedPatientId]/[lastLoadedMuscleGroup] — an earlier
  // version fetched these via effects, but saving a second session for the *same* already-
  // selected patient/muscle group never changed those dependency values, so the effects
  // never re-ran and the trend/profile silently went stale after the very save that should
  // have updated them. Deriving during render instead means they're always exactly as
  // current as `sessions` itself, with no dependency-array footgun to get wrong.
  const trendHistory: ForceLabSession[] = lastLoadedMuscleGroup
    ? sessions
        .filter((s) => s.muscleGroup === lastLoadedMuscleGroup && (s.patientId ?? null) === selectedPatientId)
        .slice()
        .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
    : [];

  const strengthProfile: StrengthProfileEntry[] = (() => {
    if (!selectedPatientId) return [];
    const forPatient = sessions
      .filter((s) => s.patientId === selectedPatientId)
      .slice()
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    const seen = new Set<string>();
    const profile: StrengthProfileEntry[] = [];
    for (const s of forPatient) {
      if (seen.has(s.muscleGroup)) continue;
      seen.add(s.muscleGroup);
      profile.push({
        muscleGroup: s.muscleGroup,
        bodyRegion: s.bodyRegion || bodyRegionForMuscle(s.muscleGroup) || "General",
        rightPeak: s.rightPeak,
        leftPeak: s.leftPeak,
        lsi: s.lsi,
        unit: s.unit,
        sessionDate: s.sessionDate,
      });
    }
    return profile;
  })();

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    setSelectedSessionId(sessionId);
    setMode("view");
    setLastLoadedMuscleGroup(session.muscleGroup);
    setSelectedPatientId(session.patientId ?? null);
  };

  const handleSaved = (session: ForceLabSession) => {
    setSessions((prev) => [session, ...prev]);
    setSelectedSessionId(session.id);
    setMode("view");
    setLastLoadedMuscleGroup(session.muscleGroup);
    setImportPrefill(null);
    router.refresh();
  };

  const handleDeleted = () => {
    if (!selectedSessionId) return;
    setSessions((prev) => prev.filter((s) => s.id !== selectedSessionId));
    setSelectedSessionId(null);
    setMode("manual");
    router.refresh();
  };

  const handleLinked = (session: ForceLabSession) => {
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
    setSelectedPatientId(session.patientId ?? null);
    router.refresh();
  };

  // A pasted assessment creates several sessions at once (one per muscle group) rather than
  // the single row every other save handler above deals with — merged into `sessions` the
  // same way so Session History / Strength Profile / Trends pick them up immediately, but
  // there's no single row to jump into "view" mode for, so this stays on the Paste
  // Assessment tab (which resets itself and shows its own confirmation — see
  // PasteAssessmentPanel).
  const handleAssessmentSaved = (assessment: ForceLabAssessmentWithSessions) => {
    setSessions((prev) => [...assessment.sessions, ...prev]);
    if (assessment.patientId) setSelectedPatientId(assessment.patientId);
    setAssessmentsVersion((v) => v + 1);
    router.refresh();
  };

  const handleEdit = () => {
    if (!selectedSession) return;
    setImportPrefill({
      muscleGroup: selectedSession.muscleGroup,
      rightPeak: selectedSession.rightPeak ?? undefined,
      leftPeak: selectedSession.leftPeak ?? undefined,
      rightTimeToPeak: selectedSession.rightTimeToPeak ?? undefined,
      leftTimeToPeak: selectedSession.leftTimeToPeak ?? undefined,
      unit: selectedSession.unit,
    });
    setSelectedSessionId(null);
    setMode("manual");
  };

  // Always available from the page header (see the button in the header row below), not
  // just from inside a loaded session's own action row — clears back to a blank Manual
  // Entry form regardless of what's currently shown in the center column.
  const handleNewSession = () => {
    setSelectedSessionId(null);
    setImportPrefill(null);
    setMode("manual");
  };

  return (
    <>
      <div className="forcelab-header-row">
        <div>
          <h1 className="forcelab-title">Force Lab</h1>
          <p className="forcelab-subtitle">Handheld dynamometer data, imported from your ActiveForce sessions</p>
        </div>
        <div className="forcelab-header-actions">
          <button type="button" className="btn btn-primary" onClick={handleNewSession}>
            New Session
          </button>
          <Link href="/profile/credentials" className="forcelab-unit-pill">
            {forceUnit}
          </Link>
        </div>
      </div>

      <div className="forcelab-columns">
        <div className="forcelab-col-history card elev-sm">
          <div className="card-kicker">Recent Sessions</div>
          {sessions.length === 0 || !mostRecentSession ? (
            <p className="forcelab-history-empty">No sessions recorded. Add your first session above.</p>
          ) : (
            <>
              <p className="forcelab-history-empty" style={{ marginBottom: 10 }}>
                {sessions.length} session{sessions.length === 1 ? "" : "s"} recorded
              </p>
              <button
                type="button"
                className={`forcelab-history-card ${selectedSessionId === mostRecentSession.id ? "forcelab-history-card--active" : ""}`}
                onClick={() => handleSelectSession(mostRecentSession.id)}
              >
                <div className="forcelab-history-card-muscle">{mostRecentSession.muscleGroup}</div>
                <div className="forcelab-history-card-date">{new Date(mostRecentSession.sessionDate).toLocaleDateString()}</div>
                <div className="forcelab-history-card-peaks">
                  <span>
                    R:{" "}
                    {mostRecentSession.rightPeak != null
                      ? `${convertForDisplay(mostRecentSession.rightPeak, mostRecentSession.unit, forceUnit)} ${forceUnit}`
                      : "—"}
                  </span>
                  <span>
                    L:{" "}
                    {mostRecentSession.leftPeak != null
                      ? `${convertForDisplay(mostRecentSession.leftPeak, mostRecentSession.unit, forceUnit)} ${forceUnit}`
                      : "—"}
                  </span>
                </div>
                <div className="forcelab-history-card-tags">
                  {mostRecentSession.lsi != null && (
                    <span
                      className="forcelab-lsi-pill"
                      style={{ color: lsiPillColor(mostRecentSession.lsi), borderColor: lsiPillColor(mostRecentSession.lsi) }}
                    >
                      LSI {mostRecentSession.lsi}%
                    </span>
                  )}
                  {mostRecentSession.patientCode && <span className="tag">{mostRecentSession.patientCode}</span>}
                </div>
              </button>
            </>
          )}
          <Link href="/pro/force-lab/sessions" className="clindash-seats-add-link" style={{ display: "inline-block", marginTop: 10 }}>
            View All Sessions →
          </Link>
        </div>

        <div className="forcelab-col-center card elev-sm">
          {mode === "view" && selectedSession ? (
            <SessionDetailView
              session={selectedSession}
              patients={patients}
              forceUnit={forceUnit}
              history={trendHistory}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
              onLinked={handleLinked}
            />
          ) : (
            <>
              <div className="clindash-tab-bar">
                <button
                  type="button"
                  className={`clindash-tab ${mode === "manual" ? "clindash-tab--active" : ""}`}
                  onClick={() => {
                    setMode("manual");
                    setImportPrefill(null);
                  }}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  className={`clindash-tab ${mode === "import" ? "clindash-tab--active" : ""}`}
                  onClick={() => setMode("import")}
                >
                  Import Screenshot
                </button>
                <button
                  type="button"
                  className={`clindash-tab ${mode === "paste" ? "clindash-tab--active" : ""}`}
                  onClick={() => setMode("paste")}
                >
                  Paste Assessment
                </button>
              </div>

              {importError && (
                <p style={{ fontSize: 12.5, color: "var(--color-danger)", margin: "0 0 10px" }}>
                  Could not read screenshot. Please enter values manually.
                </p>
              )}

              {mode === "import" ? (
                <ForceLabImportPanel
                  patients={patients}
                  forceUnit={forceUnit}
                  initialPatientId={selectedPatientId}
                  onSaved={handleSaved}
                  onParseFailed={() => {
                    setImportError(true);
                    setMode("manual");
                  }}
                />
              ) : mode === "paste" ? (
                <PasteAssessmentPanel
                  patients={patients}
                  initialPatientId={selectedPatientId}
                  onSaved={handleAssessmentSaved}
                  onPatientChange={setSelectedPatientId}
                />
              ) : (
                <ForceLabEntryForm
                  key={importPrefill ? "edit" : "fresh"}
                  patients={patients}
                  forceUnit={forceUnit}
                  initialPatientId={selectedPatientId}
                  prefill={importPrefill ?? undefined}
                  onSaved={handleSaved}
                  onPatientChange={setSelectedPatientId}
                />
              )}
            </>
          )}
        </div>

        <div className="forcelab-col-profile">
          <div className="card elev-sm">
            <div className="card-kicker">Strength Profile</div>
            {!selectedPatientId ? (
              <p className="forcelab-profile-empty" style={{ marginTop: 8 }}>
                Select a patient to see their full strength profile.
              </p>
            ) : (
              <StrengthProfilePanel profile={strengthProfile} forceUnit={forceUnit} />
            )}
          </div>

          <div className="card elev-sm" style={{ marginTop: 14 }}>
            <div className="card-kicker">Trends</div>
            {!lastLoadedMuscleGroup ? (
              <p className="forcelab-profile-empty" style={{ marginTop: 8 }}>
                Load a session to see its trend.
              </p>
            ) : (
              <ForceLabTrendChart sessions={trendHistory} unitLabel={forceUnit} />
            )}
          </div>
        </div>
      </div>

      <PastResultsSection patients={patients} initialCompareAssessmentId={initialCompareAssessmentId ?? null} refreshKey={assessmentsVersion} />
    </>
  );
}
