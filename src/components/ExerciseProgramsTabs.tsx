"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { SlidingTabs } from "@/components/SlidingTabs";

type Tab = "builder" | "movement-lab";

const TABS: { id: Tab; label: string }[] = [
  { id: "builder", label: "Builder" },
  { id: "movement-lab", label: "Movement Lab" },
];

/** Lets a control nested deep inside the Builder tab (MovementLabPicker's "Browse the full
 *  Movement Lab" link, several levels down through HepWorkspace -> HepBuilder) switch this
 *  page to the Movement Lab tab in place, instead of navigating to a different route and
 *  losing whatever the clinician has already typed into the builder. `null` outside this
 *  provider — components using useSwitchToMovementLabTab() should fall back to a plain link
 *  to /hep?tab=movement-lab when that happens. */
const SwitchToMovementLabContext = createContext<(() => void) | null>(null);

export function useSwitchToMovementLabTab() {
  return useContext(SwitchToMovementLabContext);
}

/**
 * Tab strip for /hep (Exercise Programs) — Builder and Movement Lab. Unlike the other
 * SlidingTabs consumers (ScreeningDecisionTabs, ClinicalReferenceTabs), the inactive panel
 * stays mounted rather than being swapped out of the tree: unmounting the Builder on every
 * switch would also throw away HepBuilder's uncontrolled internal state (see
 * HepInitialDraft's own comment on why it's "consumed once"), and unmounting the Movement Lab
 * browser would reset its search/filter state every time. Visibility is toggled with the
 * `hidden` attribute instead.
 *
 * The URL's `?tab=` is kept in sync via history.replaceState rather than the router, so
 * switching tabs never triggers a server round-trip that could remount the Builder subtree —
 * it only needs to be right for a fresh page load or a shared link (see initialTab, resolved
 * server-side in app/(app)/hep/page.tsx from the same param).
 */
export function ExerciseProgramsTabs({
  initialTab,
  builder,
  movementLab,
}: {
  initialTab: Tab;
  builder: ReactNode;
  movementLab: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

  function switchTab(next: Tab) {
    setTab(next);
    window.history.replaceState(null, "", next === "movement-lab" ? "/hep?tab=movement-lab" : "/hep");
  }

  return (
    <SwitchToMovementLabContext.Provider value={() => switchTab("movement-lab")}>
      <SlidingTabs tabs={TABS} active={tab} onChange={switchTab} />
      <div style={{ marginTop: 18 }} hidden={tab !== "builder"}>
        {builder}
      </div>
      <div style={{ marginTop: 18 }} hidden={tab !== "movement-lab"}>
        {movementLab}
      </div>
    </SwitchToMovementLabContext.Provider>
  );
}
