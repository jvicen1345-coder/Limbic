"use client";

import { useState } from "react";

/** Overview's Explore/Trends switcher — both panels are passed in already server-rendered
 *  (see app/(app)/wellness/page.tsx) and just toggled with `hidden` rather than conditional
 *  rendering, so switching tabs is instant with no re-fetch. */
export function WellnessOverviewTabs({ explore, trends }: { explore: React.ReactNode; trends: React.ReactNode }) {
  const [tab, setTab] = useState<"explore" | "trends">("explore");

  return (
    <div>
      <div className="wellness-tabs" role="tablist" aria-label="Health and Wellness view">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "explore"}
          className={`wellness-tab${tab === "explore" ? " wellness-tab--active" : ""}`}
          onClick={() => setTab("explore")}
        >
          Explore
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "trends"}
          className={`wellness-tab${tab === "trends" ? " wellness-tab--active" : ""}`}
          onClick={() => setTab("trends")}
        >
          Trends
        </button>
      </div>
      <div hidden={tab !== "explore"}>{explore}</div>
      <div hidden={tab !== "trends"}>{trends}</div>
    </div>
  );
}
