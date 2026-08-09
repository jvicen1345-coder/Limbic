"use client";

import { useState, useTransition } from "react";
import { saveMetricLog } from "@/app/actions/metrics";
import type { MetricsLogMetric } from "@/lib/metrics";
import { CheckIcon } from "@/components/icons";

export function AssessmentLogButton({ metric, unitLabel, label }: { metric: MetricsLogMetric; unitLabel: string; label: string }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const canSave = value.trim() !== "" && Number.isFinite(Number(value));

  const handleSave = () => {
    if (!canSave) return;
    startTransition(async () => {
      await saveMetricLog(metric, Number(value));
      setSaved(true);
    });
  };

  return (
    <div className="wellness-assess-log">
      <div className="field" style={{ flex: 1, maxWidth: 160 }}>
        <label htmlFor={`assess-${metric}`}>Your result ({unitLabel})</label>
        <input
          className="input"
          id={`assess-${metric}`}
          type="number"
          step="any"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" className="btn btn-secondary" disabled={!canSave || pending} onClick={handleSave}>
          {pending ? "Saving…" : label}
        </button>
        {saved && <CheckIcon size={14} className="profile-date-saved-check" />}
      </div>
    </div>
  );
}
