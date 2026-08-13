"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVitalsLog, logVitalsActivity } from "@/app/actions/vitals";
import { VITALS_CATEGORIES, VITALS_CATEGORY_LABEL, VITALS_CATEGORY_SUGGESTIONS, type VitalsCategory, type VitalsLogEntry } from "@/lib/vitals";
import { todayLocalDateStr } from "@/lib/today";
import { TrashIcon } from "@/components/icons";

export function LogActivityForm({ recentLogs }: { recentLogs: VitalsLogEntry[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [date, setDate] = useState(todayLocalDateStr());
  const [category, setCategory] = useState<VitalsCategory>("cardio");
  const [activity, setActivity] = useState("");
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");

  const canSave = activity.trim().length > 0 && date.length > 0 && Number(minutes) > 0;

  const handleSubmit = () => {
    if (!canSave) return;
    startTransition(async () => {
      await logVitalsActivity({ date, category, minutes: Number(minutes), activity, notes });
      setActivity("");
      setMinutes("");
      setNotes("");
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteVitalsLog(id);
      router.refresh();
    });
  };

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Log activity</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Add anything you did today, a few minutes still counts.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 130 }}>
            <label htmlFor="vitals-log-date">Date</label>
            <input className="input" id="vitals-log-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 130 }}>
            <label htmlFor="vitals-log-category">Category</label>
            <select className="input" id="vitals-log-category" value={category} onChange={(e) => setCategory(e.target.value as VitalsCategory)}>
              {VITALS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {VITALS_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="vitals-log-activity">Activity name</label>
          <input
            className="input"
            id="vitals-log-activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder={`e.g. ${VITALS_CATEGORY_SUGGESTIONS[category].slice(0, 2).join(", ")}`}
          />
        </div>

        <div className="field">
          <label htmlFor="vitals-log-minutes">Duration (minutes)</label>
          <input className="input" id="vitals-log-minutes" type="number" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="vitals-log-notes">Notes (optional)</label>
          <input className="input" id="vitals-log-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </div>

        <div>
          <button type="button" className="btn btn-primary" disabled={!canSave} onClick={handleSubmit}>
            Log Activity
          </button>
        </div>
      </div>

      {recentLogs.length > 0 && (
        <div className="vitals-log-list">
          {recentLogs.map((log) => (
            <div key={log.id} className="vitals-log-row">
              <span className="vitals-log-date">
                {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className={`vitals-chart-legend-dot vitals-color-${log.category}`} />
              <span className="vitals-log-activity">{log.activity}</span>
              <span className="vitals-log-minutes">{log.minutes} min</span>
              <button type="button" className="btn btn-ghost btn-icon" aria-label="Delete entry" onClick={() => handleDelete(log.id)}>
                <TrashIcon size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
