"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { regenerateHealthSyncKeyAction, disconnectHealthSyncAction } from "@/app/actions/health-sync";
import { ShareButton } from "@/components/ShareButton";

/** Apple Health card on /wellness/activity — a web app can't call HealthKit directly, so
 *  this authenticates an Apple Shortcuts automation the reader sets up on their own phone
 *  instead (see app/api/health-sync/route.ts, lib/health-sync.ts). `connected`/`lastSynced`
 *  reflect the HealthSyncToken row on the server; `revealedKey` only ever exists in this
 *  component's own state, straight from the just-called server action, and is gone the
 *  moment the reader navigates away. */
export function AppleHealthSyncCard({
  connected,
  lastSynced,
}: {
  connected: boolean;
  lastSynced: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [syncUrl, setSyncUrl] = useState("");

  const handleGenerate = () => {
    startTransition(async () => {
      const key = await regenerateHealthSyncKeyAction();
      setRevealedKey(key);
      setSyncUrl(`${window.location.origin}/api/health-sync`);
      router.refresh();
    });
  };

  const handleDisconnect = () => {
    startTransition(async () => {
      await disconnectHealthSyncAction();
      setRevealedKey(null);
      router.refresh();
    });
  };

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Apple Health sync</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Limbic can&rsquo;t read Apple Health directly, browsers don&rsquo;t have access to
        it, but a free Shortcut on your phone can send your workouts and mindful minutes
        here automatically. Set it up once below.
      </p>

      {revealedKey ? (
        <div
          className="field"
          style={{
            marginTop: 12,
            background: "color-mix(in srgb, var(--color-warn) 10%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-warn) 35%, transparent)",
            borderRadius: "var(--radius-md)",
            padding: 12,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 600 }}>
            Copy this key now, it won&rsquo;t be shown again. If you lose it, generate a new one.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <code
              style={{
                flex: 1,
                minWidth: 200,
                fontSize: 12,
                wordBreak: "break-all",
                background: "var(--color-surface-secondary)",
                padding: "6px 8px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {revealedKey}
            </code>
            <ShareButton text={revealedKey} label="Copy key" className="btn btn-secondary" />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
            <code
              style={{
                flex: 1,
                minWidth: 200,
                fontSize: 12,
                wordBreak: "break-all",
                background: "var(--color-surface-secondary)",
                padding: "6px 8px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {syncUrl}
            </code>
            <ShareButton text={syncUrl} label="Copy URL" className="btn btn-secondary" />
          </div>
        </div>
      ) : (
        <p className="card-body" style={{ marginTop: 8, fontStyle: "italic" }}>
          {connected
            ? lastSynced
              ? `Connected — last synced ${lastSynced}.`
              : "Connected — waiting on the first sync from your Shortcut."
            : "Not connected yet."}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-primary" disabled={isPending} onClick={handleGenerate}>
          {connected ? "Regenerate key" : "Generate sync key"}
        </button>
        {connected && (
          <button type="button" className="btn btn-ghost" disabled={isPending} onClick={handleDisconnect}>
            Disconnect
          </button>
        )}
      </div>

      <details className="wellness-calc-education" style={{ marginTop: 14 }}>
        <summary>How to set up the Shortcut</summary>
        <ol style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Generate a sync key above and copy both the key and the URL.</li>
          <li>Open the Shortcuts app on your iPhone and create a new shortcut.</li>
          <li>
            Add a <strong>Find Health Samples</strong> action for each metric you want to send
            (e.g. Workouts, Mindful Minutes), scoped to <strong>Today</strong>.
          </li>
          <li>
            Add a <strong>Text</strong> action to build the JSON body, for example:
            <pre
              style={{
                background: "var(--color-surface-secondary)",
                padding: 10,
                borderRadius: "var(--radius-sm)",
                fontSize: 11.5,
                overflowX: "auto",
                margin: "6px 0",
              }}
            >
{`{
  "date": "2026-08-23",
  "entries": [
    { "category": "cardio", "minutes": 32, "activity": "Running" },
    { "category": "mindfulness", "minutes": 10, "activity": "Meditation" }
  ]
}`}
            </pre>
            Categories: <code>cardio</code>, <code>strength</code>, <code>mobility</code>, <code>mindfulness</code>.
          </li>
          <li>
            Add a <strong>Get Contents of URL</strong> action: Method <strong>POST</strong>,
            URL is the address you copied, header <code>Authorization: Bearer &lt;your key&gt;</code>,
            request body is the JSON from the previous step.
          </li>
          <li>
            In the Shortcuts app&rsquo;s <strong>Automation</strong> tab, add a new personal
            automation that runs this shortcut once a day (e.g. every evening) and turn off
            &ldquo;Ask Before Running&rdquo; so it sends quietly.
          </li>
        </ol>
      </details>
    </div>
  );
}
