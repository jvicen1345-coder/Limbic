"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmFoundingFunderPaymentAction, removeFoundingFunderAction } from "@/app/actions/founding-funders";

export interface RosterEntry {
  id: string;
  displayName: string;
  credential: string | null;
  paymentStatus: string;
}

/** Admin-only roster of every FoundingFunder row (confirmed + pending), with the manual
 *  overrides a webhook failure would otherwise require direct DB access for: "Confirm
 *  Payment" (same effect as the checkout.session.completed webhook / success-page backup
 *  check, just admin-triggered) and "Remove" (deletes the row outright, reopening that
 *  spot). Only pending/confirmed rows exist at all — a failed/canceled checkout's row is
 *  deleted immediately (see cleanupCanceledFoundingFunderCheckout), never lingers here as
 *  "failed". Uses router.refresh() after each action rather than optimistic local removal,
 *  so the confirmed/pending counts and the public grid above always match what actually
 *  happened server-side. */
export function FoundingFundersRoster({ entries, confirmedCount, pendingCount }: { entries: RosterEntry[]; confirmedCount: number; pendingCount: number }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const confirmed = entries.filter((e) => e.paymentStatus === "confirmed");
  const pending = entries.filter((e) => e.paymentStatus === "pending");

  const runAction = (id: string, action: (id: string) => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      setPendingId(null);
      router.refresh();
    });
  };

  return (
    <div className="ff-admin ff-roster">
      <p className="ff-admin-title">Founding Funders — payment roster</p>

      <div className="ff-roster-counts">
        <div className="ff-roster-count ff-roster-count--confirmed">
          <span className="ff-roster-count-number">{confirmedCount}</span>
          <span className="ff-roster-count-label">Confirmed</span>
        </div>
        <div className="ff-roster-count ff-roster-count--pending">
          <span className="ff-roster-count-number">{pendingCount}</span>
          <span className="ff-roster-count-label">Pending</span>
        </div>
      </div>

      {error && <p className="ff-admin-message ff-admin-message--error">{error}</p>}

      {pending.length > 0 && (
        <div className="ff-roster-group">
          <p className="ff-roster-group-title">Pending</p>
          {pending.map((entry) => (
            <div className="ff-roster-row ff-roster-row--pending" key={entry.id}>
              <div className="ff-roster-row-info">
                <div className="ff-roster-row-name">{entry.displayName}</div>
                {entry.credential && <div className="ff-roster-row-credential">{entry.credential}</div>}
              </div>
              <div className="ff-roster-row-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isPending && pendingId === entry.id}
                  onClick={() => runAction(entry.id, confirmFoundingFunderPaymentAction)}
                >
                  Confirm Payment
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={isPending && pendingId === entry.id}
                  onClick={() => runAction(entry.id, removeFoundingFunderAction)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="ff-roster-group">
          <p className="ff-roster-group-title">Confirmed</p>
          {confirmed.map((entry) => (
            <div className="ff-roster-row ff-roster-row--confirmed" key={entry.id}>
              <div className="ff-roster-row-info">
                <div className="ff-roster-row-name">{entry.displayName}</div>
                {entry.credential && <div className="ff-roster-row-credential">{entry.credential}</div>}
              </div>
              <div className="ff-roster-row-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={isPending && pendingId === entry.id}
                  onClick={() => runAction(entry.id, removeFoundingFunderAction)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && <p className="ff-roster-empty">No claims yet.</p>}
    </div>
  );
}
