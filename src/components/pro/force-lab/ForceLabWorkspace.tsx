"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StrengthProfileEntry } from "@/app/actions/force-lab";
import { SessionHistoryPanel } from "./SessionHistoryPanel";
import { ForceLabEntryForm } from "./ForceLabEntryForm";
import { ForceLabImportPanel } from "./ForceLabImportPanel";
import { SessionDetailView } from "./SessionDetailView";
import { StrengthProfilePanel } from "./StrengthProfilePanel";
import { ForceLabTrendChart } from "./ForceLabTrendChart";
import { bodyRegionForMuscle } from "@/lib/force-lab-muscles";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import type { ForceLabSession } from "@/generated/prisma/client";
import type { ForceLabPrefill } from "./ForceLabEntryForm";

type CenterMode = "manual" | "import" | "view";

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

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

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

  return (
    <>
      <div className="forcelab-header-row">
        <div>
          <h1 className="forcelab-title">Force Lab</h1>
          <p className="forcelab-subtitle">Handheld dynamometer data — powered by ActiveForce</p>
        </div>
        <Link href="/profile/credentials" className="forcelab-unit-pill">
          {forceUnit}
        </Link>
      </div>

      <div className="forcelab-columns">
        <div className="forcelab-col-history">
          <SessionHistoryPanel sessions={sessions} forceUnit={forceUnit} selectedSessionId={selectedSessionId} onSelect={handleSelectSession} />
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
              onNewSession={() => {
                setSelectedSessionId(null);
                setImportPrefill(null);
                setMode("manual");
              }}
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
    </>
  );
}
