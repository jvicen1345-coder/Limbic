"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncFitnessConnectionAction, disconnectFitnessConnectionAction } from "@/app/actions/fitness-connections";

interface TrackerStatus {
  enabled: boolean;
  connected: boolean;
  lastSynced: string | null;
}

/** One row per tracker on the Activity Log's "Connect a tracker" card — Fitbit and Strava
 *  both expose real OAuth2 APIs (unlike Apple Health, see AppleHealthSyncCard.tsx/
 *  AppleHealthUploadCard.tsx for that workaround), so connecting is a plain redirect to
 *  the provider's own consent screen (see app/auth/fitbit/route.ts, app/auth/strava/
 *  route.ts) rather than anything this component drives itself. A tracker whose env vars
 *  aren't configured (see lib/fitbit-oauth.ts fitbitEnabled, lib/strava-oauth.ts
 *  stravaEnabled) doesn't render a row at all, same convention as "Continue with Google"
 *  on the sign-in screen. */
function TrackerRow({
  label,
  provider,
  status,
}: {
  label: string;
  provider: "fitbit" | "strava";
  status: TrackerStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!status.enabled) return null;

  const handleSync = () => {
    startTransition(async () => {
      await syncFitnessConnectionAction(provider);
      router.refresh();
    });
  };

  const handleDisconnect = () => {
    startTransition(async () => {
      await disconnectFitnessConnectionAction(provider);
      router.refresh();
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--color-divider)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
          {status.connected ? (status.lastSynced ? `Connected — last synced ${status.lastSynced}` : "Connected — syncing soon") : "Not connected"}
        </div>
      </div>
      {status.connected ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-secondary" disabled={isPending} onClick={handleSync}>
            Sync now
          </button>
          <button type="button" className="btn btn-ghost" disabled={isPending} onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <a href={`/auth/${provider}`} className="btn btn-primary">
          Connect {label}
        </a>
      )}
    </div>
  );
}

export function TrackerConnectCard({
  fitbit,
  strava,
}: {
  fitbit: TrackerStatus;
  strava: TrackerStatus;
}) {
  if (!fitbit.enabled && !strava.enabled) return null;

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Connect a tracker</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Fitbit and Strava both sync automatically once connected, no automations to set up.
      </p>
      <TrackerRow label="Fitbit" provider="fitbit" status={fitbit} />
      <TrackerRow label="Strava" provider="strava" status={strava} />
    </div>
  );
}
