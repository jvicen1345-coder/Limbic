"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signInAction, signInGeneralAction } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/icons";

const TABS = [
  { id: "pt" as const, label: "Physical Therapist" },
  { id: "general" as const, label: "General" },
];

/** localStorage keys for remembering what a returning visitor last typed, so they don't
 *  have to retype it. Device-local convenience only — not part of the auth flow itself. */
const STORAGE_KEYS = {
  licenseNumber: "limbic:signIn:licenseNumber",
  licenseState: "limbic:signIn:licenseState",
  generalEmail: "limbic:signIn:generalEmail",
};

export function SignInForm({ states, googleEnabled }: { states: string[]; googleEnabled: boolean }) {
  const [mode, setMode] = useState<"pt" | "general">("pt");
  const numberRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLSelectElement>(null);
  const generalEmailRef = useRef<HTMLInputElement>(null);

  // Fills in whatever this tab's inputs are mounted (imperatively, via ref — not React
  // state, so there's no server/client markup to reconcile and nothing to hydrate around).
  // Re-runs on every tab switch so each tab's own remembered value is restored.
  useEffect(() => {
    if (mode === "pt") {
      const savedNumber = localStorage.getItem(STORAGE_KEYS.licenseNumber);
      if (savedNumber && numberRef.current) numberRef.current.value = savedNumber;
      const savedState = localStorage.getItem(STORAGE_KEYS.licenseState);
      if (savedState && stateRef.current) stateRef.current.value = savedState;
    } else {
      const savedEmail = localStorage.getItem(STORAGE_KEYS.generalEmail);
      if (savedEmail && generalEmailRef.current) generalEmailRef.current.value = savedEmail;
    }
  }, [mode]);

  const rememberPtFields = () => {
    if (numberRef.current?.value) localStorage.setItem(STORAGE_KEYS.licenseNumber, numberRef.current.value);
    if (stateRef.current?.value) localStorage.setItem(STORAGE_KEYS.licenseState, stateRef.current.value);
  };

  const rememberGeneralEmail = () => {
    if (generalEmailRef.current?.value) localStorage.setItem(STORAGE_KEYS.generalEmail, generalEmailRef.current.value);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 380,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        padding: 32,
        boxShadow: "var(--shadow-md)",
      }}
    >
      {googleEnabled && (
        <>
          <a href="/auth/google" className="btn btn-secondary btn-block" style={{ marginTop: 0 }}>
            <GoogleIcon size={18} />
            Continue with Google
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <hr className="hr" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>or</span>
            <hr className="hr" style={{ flex: 1, margin: 0 }} />
          </div>
        </>
      )}
      <div role="tablist" aria-label="Sign-in type" className="pill-tabs" style={{ marginBottom: 0 }}>
        {TABS.map((t) => {
          const active = mode === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(t.id)}
              className={active ? "pill-tab active" : "pill-tab"}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {mode === "pt" ? (
        <form
          action={signInAction}
          onSubmit={rememberPtFields}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
            Sign in with your license to track renewals and CE requirements alongside your feed.
          </p>

          <div className="field">
            <label htmlFor="li-number">License number</label>
            <input
              ref={numberRef}
              className="input"
              id="li-number"
              name="number"
              placeholder="PT-48213"
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="li-state">Issuing state</label>
            <select
              ref={stateRef}
              className="input"
              id="li-state"
              name="state"
              defaultValue="California"
              autoComplete="address-level1"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="li-email">Email</label>
            <input
              className="input"
              id="li-email"
              name="email"
              type="email"
              placeholder="you@clinic.com"
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
          <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: 0, textAlign: "center" }}>
            Demo sign-in — any license number works.
          </p>
        </form>
      ) : (
        <form
          action={signInGeneralAction}
          onSubmit={rememberGeneralEmail}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
            Not a licensed PT? Sign in with just your email to read, search, and save articles and
            personalize your profile.
          </p>

          <div className="field">
            <label htmlFor="general-email">Email</label>
            <input
              ref={generalEmailRef}
              className="input"
              id="general-email"
              name="generalEmail"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
          <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: 0, textAlign: "center" }}>
            Demo sign-in — any email works. Signing in again with the same email returns to your
            saved articles and profile.
          </p>
        </form>
      )}

      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0, textAlign: "center" }}>
        By signing in you agree to our{" "}
        <Link href="/terms" style={{ color: "var(--color-neutral-700)", textDecoration: "underline" }}>
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" style={{ color: "var(--color-neutral-700)", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
