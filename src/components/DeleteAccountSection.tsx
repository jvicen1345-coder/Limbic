"use client";

import { useState } from "react";
import { deleteAccountAction } from "@/app/actions/profile";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { XIcon } from "@/components/icons";

const CONFIRM_TEXT = "DELETE";

/** The "danger zone" at the bottom of Profile — reuses the calendar's modal shell (see
 *  .cal-modal-* in globals.css) rather than inventing a new one. `hasFoundingSpot` only
 *  changes the modal's copy (see app/actions/profile.ts deleteAccountAction for what
 *  actually survives) — the reader shouldn't have to already know that detail to
 *  understand what deleting their account does and doesn't erase. */
export function DeleteAccountSection({ hasFoundingSpot }: { hasFoundingSpot: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { shouldRender, closing } = useExitAnimation(open, 200);

  const canDelete = confirmText.trim() === CONFIRM_TEXT;

  const close = () => {
    setOpen(false);
    setConfirmText("");
  };

  return (
    <div
      className="card elev-sm"
      style={{ marginTop: 18, border: "1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)" }}
    >
      <div className="card-kicker" style={{ color: "var(--color-danger)" }}>
        Danger zone
      </div>
      <p className="card-body" style={{ marginTop: 6 }}>
        Permanently delete your account and everything tied to it — saved articles, reading
        history, Nexus connections and messages, HEP programs, calendar events, and vitals.
        This can&rsquo;t be undone.
      </p>
      <button
        type="button"
        className="btn"
        style={{ marginTop: 10, background: "var(--color-danger)", color: "#fff", border: "none" }}
        onClick={() => setOpen(true)}
      >
        Delete my account
      </button>

      {shouldRender && (
        <div className={`cal-modal-backdrop${closing ? " cal-modal-closing" : ""}`} onClick={close}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-header">
              <div className="cal-modal-title">Delete your account?</div>
              <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={close}>
                <XIcon size={16} />
              </button>
            </div>

            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--color-text)", margin: 0 }}>
              This permanently deletes your account and everything tied to it — saved
              articles, reading history, Nexus connections and messages, HEP programs,
              calendar events, and vitals. This can&rsquo;t be undone.
            </p>
            {hasFoundingSpot && (
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--color-neutral-700)", margin: "10px 0 0" }}>
                Your Founding Funder listing will stay in the Founding 25 grid — that
                stays permanent regardless of what happens to this account.
              </p>
            )}

            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="delete-confirm">
                Type <strong>{CONFIRM_TEXT}</strong> to confirm
              </label>
              <input
                id="delete-confirm"
                className="input"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="cal-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={close}>
                Cancel
              </button>
              <form action={deleteAccountAction}>
                <button
                  type="submit"
                  className="btn"
                  disabled={!canDelete}
                  style={{ background: "var(--color-danger)", color: "#fff", border: "none" }}
                >
                  Permanently delete my account
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
