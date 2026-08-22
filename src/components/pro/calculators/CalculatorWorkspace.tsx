"use client";

import { useCallback, useState } from "react";
import { CalculatorProfileProvider } from "./CalculatorProfileContext";
import { CalculatorProfilesPanel } from "./CalculatorProfilesPanel";
import { saveCalculatorResultAction, type CalculatorProfileView } from "@/app/actions/calculator-profiles";

/** Owns the Calculator Profiles state for the whole /pro/calculators page — the calculator
 *  grid (passed in as `children`, still server-rendered) and the right-side panel both need
 *  to see the same active profile, so this is the one client boundary both sit inside. See
 *  CalculatorProfileContext.tsx for why the grid needs a context rather than a prop (its
 *  individual calculator components are nested arbitrarily deep). */
export function CalculatorWorkspace({
  initialProfiles,
  children,
}: {
  initialProfiles: CalculatorProfileView[];
  children: React.ReactNode;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(initialProfiles[0]?.id ?? null);
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;

  // Depends only on the id (a stable primitive), not the activeProfile object itself, so
  // this doesn't get a new identity every time a result is added to it — see CalcModal's
  // effect-free usage of this callback.
  const saveResult = useCallback(
    async (testKey: string, testName: string, value: string, interpretation: string) => {
      if (!activeProfileId) return false;
      const result = await saveCalculatorResultAction(activeProfileId, testKey, testName, value, interpretation);
      if (!result.ok || !result.result) return false;
      const saved = result.result;
      setProfiles((prev) => prev.map((p) => (p.id === activeProfileId ? { ...p, results: [saved, ...p.results] } : p)));
      return true;
    },
    [activeProfileId]
  );

  return (
    <CalculatorProfileProvider value={{ activeProfileLabel: activeProfile?.label ?? null, saveResult }}>
      <div className="pro-calc-layout">
        <div className="pro-calc-main">{children}</div>
        <CalculatorProfilesPanel
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfileId}
          onProfileCreated={(profile) => {
            setProfiles((prev) => [profile, ...prev]);
            setActiveProfileId(profile.id);
          }}
          onProfileDeleted={(profileId) => {
            setProfiles((prev) => prev.filter((p) => p.id !== profileId));
            setActiveProfileId((prev) => (prev === profileId ? null : prev));
          }}
          onResultDeleted={(profileId, resultId) => {
            setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, results: p.results.filter((r) => r.id !== resultId) } : p)));
          }}
        />
      </div>
    </CalculatorProfileProvider>
  );
}
