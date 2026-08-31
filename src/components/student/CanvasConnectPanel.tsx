"use client";

import { useState, useTransition } from "react";
import { connectCanvasAction, disconnectCanvasAction, syncCanvasNowAction, type CanvasConnectionInfo } from "@/app/actions/canvas";

function formatSyncedAt(date: Date | null): string {
  if (!date) return "Never synced";
  return `Last synced ${new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
}

/** Connect/manage panel for a student's Canvas LMS account (see app/actions/canvas.ts,
 *  lib/canvas.ts, prisma/schema.prisma's CanvasConnection comment for why this is a Personal
 *  Access Token flow rather than the OAuth2 "Connect" buttons elsewhere in this app, e.g.
 *  Strava/Fitbit on the Activity Log). Lives at the top of
 *  app/(app)/student/assignments/page.tsx, above the syllabus tracker — once connected,
 *  Canvas assignments merge into the same Assignment list that page, the Atrium's This Week
 *  card, and its monthly calendar all read from. */
export function CanvasConnectPanel({ initialConnection }: { initialConnection: CanvasConnectionInfo | null }) {
  const [connection, setConnection] = useState(initialConnection);
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConnect() {
    setError(null);
    setStatus(null);
    if (!domain.trim() || !token.trim()) {
      setError("Canvas domain and access token are both required.");
      return;
    }
    startTransition(async () => {
      const result = await connectCanvasAction(domain, token);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setConnection({ domain: domain.trim(), canvasName: null, lastSyncedAt: new Date() });
      setToken("");
      setStatus(`Connected — imported ${result.synced} assignment${result.synced === 1 ? "" : "s"}.`);
    });
  }

  function handleSync() {
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const result = await syncCanvasNowAction();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setConnection((prev) => (prev ? { ...prev, lastSyncedAt: new Date() } : prev));
      setStatus(`Synced — ${result.synced} assignment${result.synced === 1 ? "" : "s"} from Canvas.`);
    });
  }

  function handleDisconnect() {
    if (!window.confirm("Disconnect Canvas? This removes every assignment Canvas synced here — your syllabus-tracked assignments are unaffected.")) return;
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const result = await disconnectCanvasAction();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setConnection(null);
    });
  }

  if (connection) {
    return (
      <div className="canvas-connect-panel canvas-connect-panel--connected">
        <div className="canvas-connect-header">
          <div>
            <div className="canvas-connect-title">Canvas connected</div>
            <div className="canvas-connect-meta">
              {connection.canvasName ? `${connection.canvasName} · ` : ""}
              {connection.domain} · {formatSyncedAt(connection.lastSyncedAt)}
            </div>
          </div>
          <div className="canvas-connect-actions">
            <button type="button" className="btn btn-secondary" onClick={handleSync} disabled={pending}>
              {pending ? "Syncing…" : "Sync now"}
            </button>
            <button type="button" className="canvas-connect-disconnect" onClick={handleDisconnect} disabled={pending}>
              Disconnect
            </button>
          </div>
        </div>
        {status && <p className="canvas-connect-status">{status}</p>}
        {error && <p className="syllabi-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="canvas-connect-panel">
      <div className="canvas-connect-title">Connect Canvas</div>
      <p className="canvas-connect-desc">
        Sync assignments straight from your school&rsquo;s Canvas — no need to paste in a syllabus. Generate a token from{" "}
        <strong>Canvas → Account → Settings → New Access Token</strong>, then paste your school&rsquo;s Canvas domain and the
        token below.
      </p>
      <div className="canvas-connect-form">
        <div className="field">
          <label htmlFor="canvas-domain">Canvas Domain</label>
          <input
            id="canvas-domain"
            className="input"
            type="text"
            placeholder="e.g. myschool.instructure.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="canvas-token">Access Token</label>
          <input
            id="canvas-token"
            className="input"
            type="password"
            placeholder="Paste your Canvas access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="syllabi-error">{error}</p>}
      <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleConnect} disabled={pending}>
        {pending ? "Connecting…" : "Connect Canvas"}
      </button>
    </div>
  );
}
