"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCEPreferences } from "@/app/actions/pro-toolbox";
import { US_STATES } from "@/lib/us-states";
import { CheckIcon } from "@/components/icons";

export function CELicenseCard({
  ceState,
  ceLicenseExpiry,
  ceRenewalCycle,
  ceTotalRequired,
}: {
  ceState: string;
  ceLicenseExpiry: string;
  ceRenewalCycle: number;
  ceTotalRequired: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState(ceState);
  const [expiry, setExpiry] = useState(ceLicenseExpiry);
  const [cycle, setCycle] = useState(ceRenewalCycle || 2);
  const [required, setRequired] = useState(ceTotalRequired || 30);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      await updateCEPreferences({ ceState: state, ceLicenseExpiry: expiry, ceRenewalCycle: cycle, ceTotalRequired: required });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
      router.refresh();
    });
  };

  return (
    <div className="card elev-sm">
      <div className="card-kicker">License information</div>
      <div className="pro-grid-2" style={{ marginTop: 10 }}>
        <div className="field">
          <label htmlFor="ce-state">Licensing state</label>
          <select id="ce-state" className="input" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Select a state...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ce-expiry">License expiration date</label>
          <input id="ce-expiry" className="input" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ce-cycle">Renewal cycle</label>
          <select id="ce-cycle" className="input" value={cycle} onChange={(e) => setCycle(Number(e.target.value))}>
            <option value={1}>1 year</option>
            <option value={2}>2 year</option>
            <option value={3}>3 year</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="ce-required">Required CE hours</label>
          <input id="ce-required" className="input" type="number" min={0} value={required} onChange={(e) => setRequired(Number(e.target.value))} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && <CheckIcon size={14} className="profile-date-saved-check" />}
      </div>
    </div>
  );
}
