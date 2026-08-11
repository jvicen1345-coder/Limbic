"use client";

import { useState } from "react";
import { createFoundingFunderCheckout } from "@/app/actions/founding-funders";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { XIcon } from "@/components/icons";

/** The "Claim a Spot" trigger + its two-step modal — self-contained (owns its own open/step/
 *  form state) so the rest of Section 5 of /founding-funders just renders this one component.
 *  Step 1 collects a display name/credential; step 2 shows the $40 summary and starts a real
 *  Stripe Checkout Session (createFoundingFunderCheckout), redirecting the browser there on
 *  success. Modal shell is its own .ff-modal-* CSS (not the app's shared .cal-modal-* — see
 *  the .ff-page comment in globals.css) so it stays on this page's --ff-* dark palette
 *  regardless of the site's actual light/dark toggle. */
export function ClaimSpotButton() {
  const [open, setOpen] = useState(false);
  const { shouldRender, closing } = useExitAnimation(open, 200);

  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState("");
  const [credential, setCredential] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setOpen(false);
    // Reset after the close animation plays, not immediately — an instant reset would show
    // the empty step 1 form flash behind the fade-out.
    window.setTimeout(() => {
      setStep(1);
      setDisplayName("");
      setCredential("");
      setError(null);
      setPending(false);
    }, 200);
  };

  const handlePay = async () => {
    setError(null);
    setPending(true);
    const result = await createFoundingFunderCheckout({ displayName, credential: credential.trim() || undefined });
    if (result.ok && result.url) {
      // Deliberately don't clear `pending` here — the button should keep reading
      // "Processing..." through the redirect rather than flash back to "Pay $40" first.
      window.location.href = result.url;
      return;
    }
    setPending(false);
    setError(result.error ?? "Something went wrong. Try again.");
  };

  return (
    <>
      <button type="button" className="ff-claim-button" onClick={() => setOpen(true)}>
        Claim a Spot
      </button>

      {shouldRender && (
        <div className={`ff-modal-backdrop${closing ? " ff-modal-closing" : ""}`} onClick={handleClose}>
          <div className="ff-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ff-modal-header">
              <button type="button" className="ff-modal-close" aria-label="Close" onClick={handleClose}>
                <XIcon size={16} />
              </button>
            </div>

            {step === 1 ? (
              <>
                <h2 className="ff-modal-heading">Claim Your Founding Spot</h2>
                <p className="ff-modal-subtext">Lifetime access. 25 spots total. Round 1 closes when they&rsquo;re gone.</p>

                <div className="ff-modal-field">
                  <label htmlFor="ff-claim-name">Display name</label>
                  <input
                    id="ff-claim-name"
                    className="ff-modal-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="What appears in the founder grid"
                    autoFocus
                  />
                </div>
                <div className="ff-modal-field">
                  <label htmlFor="ff-claim-credential">Credential (optional)</label>
                  <input
                    id="ff-claim-credential"
                    className="ff-modal-input"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="e.g. DPT Student, SPT, PT, DPT"
                  />
                </div>

                <button type="button" className="ff-modal-next" disabled={!displayName.trim()} onClick={() => setStep(2)}>
                  Next
                </button>
              </>
            ) : (
              <>
                <h2 className="ff-modal-heading">Complete Your Claim</h2>

                <div className="ff-modal-summary">
                  <div className="ff-modal-summary-name">{displayName.trim()}</div>
                  {credential.trim() && <div className="ff-modal-summary-credential">{credential.trim()}</div>}
                </div>

                <div className="ff-modal-amount">$40 — Lifetime Access</div>

                <ul className="ff-modal-bullets">
                  <li>Lifetime access to Limbic — all current and future features</li>
                  <li>Founding Funder status — permanent recognition on the platform</li>
                  <li>Your name on the Founding Funders wall from day one</li>
                </ul>

                <p className="ff-modal-legal">This is a membership purchase, not equity or ownership in Limbic.</p>

                {error && <p className="ff-modal-error">{error}</p>}

                <button type="button" className="ff-modal-pay" disabled={pending} onClick={handlePay}>
                  {pending ? "Processing..." : "Pay $40 with Stripe"}
                </button>
                <button type="button" className="ff-modal-back" disabled={pending} onClick={() => setStep(1)}>
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
