"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signInAction, signUpAction, guestSignInAction } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/icons";

const TABS = [
  { id: "pt" as const, label: "Physical Therapist" },
  { id: "general" as const, label: "General" },
];

/** localStorage keys for remembering what a returning visitor last typed, so they don't
 *  have to retype it. Device-local convenience only, email address only — never the
 *  password — not part of the auth flow itself. */
const STORAGE_KEYS = {
  ptEmail: "limbic:signIn:ptEmail",
  generalEmail: "limbic:signIn:generalEmail",
};

/** One tab's actual form — email + password (+ confirm, in signup mode) — shared by both
 *  the "Physical Therapist" and "General" tabs below, which only ever differed in copy, not
 *  in what they collect or which action they submit to. */
function TabForm({
  authMode,
  copy,
  emailId,
  emailRef,
  initialEmail,
  onSubmit,
}: {
  authMode: "signin" | "signup";
  copy: string;
  emailId: string;
  emailRef: React.RefObject<HTMLInputElement | null>;
  initialEmail: string;
  onSubmit: () => void;
}) {
  return (
    <form
      action={authMode === "signup" ? signUpAction : signInAction}
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>{copy}</p>

      <div className="field">
        <label htmlFor={emailId}>Email</label>
        <input
          ref={emailRef}
          className="input"
          id={emailId}
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          defaultValue={initialEmail}
          required
        />
      </div>

      <div className="field">
        <label htmlFor={`${emailId}-password`}>Password</label>
        <input
          className="input"
          id={`${emailId}-password`}
          name="password"
          type="password"
          autoComplete={authMode === "signup" ? "new-password" : "current-password"}
          minLength={authMode === "signup" ? 8 : undefined}
          required
        />
      </div>

      {authMode === "signup" && (
        <div className="field">
          <label htmlFor={`${emailId}-confirm`}>Confirm password</label>
          <input
            className="input"
            id={`${emailId}-confirm`}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      )}

      {authMode === "signin" && (
        <Link href="/forgot-password" style={{ fontSize: 12.5, color: "var(--color-neutral-700)", alignSelf: "flex-end" }}>
          Forgot password?
        </Link>
      )}

      <button type="submit" className="btn btn-primary btn-block">
        {authMode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}

export function SignInForm({
  googleEnabled,
  initialEmail = "",
  initialAuthMode = "signin",
}: {
  googleEnabled: boolean;
  initialEmail?: string;
  initialAuthMode?: "signin" | "signup";
}) {
  const [mode, setMode] = useState<"pt" | "general">("pt");
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialAuthMode);
  const ptEmailRef = useRef<HTMLInputElement>(null);
  const generalEmailRef = useRef<HTMLInputElement>(null);

  // Fills in whatever this tab's input is mounted (imperatively, via ref — not React
  // state, so there's no server/client markup to reconcile and nothing to hydrate around).
  // Re-runs on every tab switch so each tab's own remembered value is restored. Skipped
  // when the server already handed back a specific email (e.g. after a failed sign-in) —
  // that value takes priority over whatever was last remembered.
  useEffect(() => {
    if (initialEmail) return;
    if (mode === "pt") {
      const savedEmail = localStorage.getItem(STORAGE_KEYS.ptEmail);
      if (savedEmail && ptEmailRef.current) ptEmailRef.current.value = savedEmail;
    } else {
      const savedEmail = localStorage.getItem(STORAGE_KEYS.generalEmail);
      if (savedEmail && generalEmailRef.current) generalEmailRef.current.value = savedEmail;
    }
  }, [mode, initialEmail]);

  const rememberPtEmail = () => {
    if (ptEmailRef.current?.value) localStorage.setItem(STORAGE_KEYS.ptEmail, ptEmailRef.current.value);
  };

  const rememberGeneralEmail = () => {
    if (generalEmailRef.current?.value) localStorage.setItem(STORAGE_KEYS.generalEmail, generalEmailRef.current.value);
  };

  return (
    <div
      className="signin-card"
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
        <TabForm
          authMode={authMode}
          copy={
            authMode === "signup"
              ? "Create an account as a physical therapist; you can verify your license anytime from your profile to unlock clinician features."
              : "Sign in as a physical therapist; you can verify your license anytime from your profile to unlock clinician features."
          }
          emailId="li-email"
          emailRef={ptEmailRef}
          initialEmail={initialEmail}
          onSubmit={rememberPtEmail}
        />
      ) : (
        <TabForm
          authMode={authMode}
          copy={
            authMode === "signup"
              ? "Not a licensed PT? Create an account with your email to read, search, and save articles and personalize your profile."
              : "Not a licensed PT? Sign in with your email to read, search, and save articles and personalize your profile."
          }
          emailId="general-email"
          emailRef={generalEmailRef}
          initialEmail={initialEmail}
          onSubmit={rememberGeneralEmail}
        />
      )}

      <button
        type="button"
        className="btn btn-ghost btn-block"
        onClick={() => setAuthMode((m) => (m === "signup" ? "signin" : "signup"))}
        style={{ marginTop: -4 }}
      >
        {authMode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>

      <form action={guestSignInAction}>
        <button type="submit" className="btn btn-ghost btn-block">
          Continue as guest
        </button>
      </form>

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
