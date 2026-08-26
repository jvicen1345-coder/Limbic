"use client";

import { useEffect, useState } from "react";
import type { MutableRefObject } from "react";
import Link from "next/link";
import { getConditionIntelligence, type ConditionIntelligenceData } from "@/app/actions/clinician-dashboard";
import type { OutcomeMeasuresSectionHandle } from "./OutcomeMeasuresSection";

/** Active-patient workspace, between the patient header and the Pre-Visit Brief section —
 *  self-fetching off `condition` alone (see getConditionIntelligence, a static lookup) so
 *  ClinicianDashboard.tsx doesn't need to know about this feature at all. Renders nothing
 *  when the patient's condition string has no exact match in
 *  lib/condition-intelligence.ts. */
export function ConditionIntelligenceCard({
  condition,
  outcomeActionsRef,
}: {
  condition: string;
  outcomeActionsRef: MutableRefObject<OutcomeMeasuresSectionHandle | null>;
}) {
  const [data, setData] = useState<ConditionIntelligenceData | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getConditionIntelligence(condition).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoadedFor(condition);
    });
    return () => {
      cancelled = true;
    };
  }, [condition]);

  if (loadedFor !== condition || !data) return null;

  return (
    <div className="clindash-section">
      <div className="card-kicker" style={{ margin: 0 }}>
        Condition Intelligence
      </div>
      <div className="clindash-ci-grid">
        <div>
          <div className="clindash-ci-section-title">Recommended Measures</div>
          <div className="clindash-ci-measures">
            {data.topMeasures.map((m) => (
              <button
                key={m}
                type="button"
                className="clindash-ci-measure-pill"
                onClick={() => outcomeActionsRef.current?.prefillMeasure(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="clindash-ci-section-title">Expected Episode</div>
          <p className="clindash-ci-text">{data.episodeLength}</p>
        </div>
        <div>
          <div className="clindash-ci-section-title">Clinical Guideline</div>
          <p className="clindash-ci-text">
            {data.guideline}
            <Link href={`/search?q=${encodeURIComponent(data.guideline)}`} className="clindash-ci-find-link">
              Find
            </Link>
          </p>
        </div>
        <div>
          <div className="clindash-ci-section-title">Board Pearl</div>
          <p className="clindash-ci-pearl">{data.boardPearl}</p>
        </div>
      </div>
    </div>
  );
}
