"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signInAction, signUpAction, guestSignInAction } from "@/app/actions/auth";
import { ACCEPT_TERMS_FIELD } from "@/lib/legal-terms";
import { GoogleIcon } from "@/components/icons";

const TABS = [
  { id: "email" as const, label: "Email" },
  { id: "guest" as const, label: "Guest" },
];

/** localStorage key for remembering what a returning visitor last typed, so they don't have
 *  to retype it. Device-local convenience only, email address only — never the password —
 *  not part of the auth flow itself. */
const EMAIL_STORAGE_KEY = "limbic:signIn:email";

/** The clickwrap checkbox both account-creating forms render (email signup and guest).
 *  Unticked by default and never pre-checked — a pre-ticked box is not affirmative assent
 *  — and backed by a server-side check in app/actions/auth.ts, since `required` here is
 *  only a convenience. Signing *in* to an existing account doesn't render this: that
 *  account already has a recorded acceptance (User.termsAcceptedAt). */
function AcceptTermsField({ id }: { id: string }) {
  return (
    <div className="accept-terms">
      <input className="accept-terms-box" id={id} name={ACCEPT_TERMS_FIELD} type="checkbox" required />
      <label className="accept-terms-label" htmlFor={id}>
        I have read and agree to the{" "}
        <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </label>
    </div>
  );
}

/** The Email tab's form — email + password (+ confirm, in signup mode). PTs and everyone
 *  else use the same form (see AddLicenseModal on Profile for license verification), so
 *  there's no separate clinician-specific copy or fields here anymore. */
function EmailForm({
  authMode,
  emailRef,
  initialEmail,
  onSubmit,
}: {
  authMode: "signin" | "signup";
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
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
        {authMode === "signup"
          ? "Create an account with your email to read, search, and save articles, personalize your profile, and verify your PT license anytime from Profile to unlock clinician features."
          : "Sign in with your email to read, search, and save articles, personalize your profile, and access clinician features if you've verified your PT license."}
      </p>

      <div className="field">
        <label htmlFor="si-email">Email</label>
        <input
          ref={emailRef}
          className="input"
          id="si-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          defaultValue={initialEmail}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="si-password">Password</label>
        <input
          className="input"
          id="si-password"
          name="password"
          type="password"
          autoComplete={authMode === "signup" ? "new-password" : "current-password"}
          minLength={authMode === "signup" ? 8 : undefined}
          required
        />
      </div>

      {authMode === "signup" && (
        <div className="field">
          <label htmlFor="si-confirm">Confirm password</label>
          <input
            className="input"
            id="si-confirm"
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

      {authMode === "signup" && <AcceptTermsField id="si-accept-terms" />}

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
  initialTab = "email",
}: {
  googleEnabled: boolean;
  initialEmail?: string;
  initialAuthMode?: "signin" | "signup";
  /** Reopens the Guest tab after guestSignInAction redirects back with a validation error
   *  (missing name) or a rate-limit error — otherwise that error would show up while the
   *  form silently defaults back to the Email tab, looking unrelated to what was submitted. */
  initialTab?: "email" | "guest";
}) {
  const [mode, setMode] = useState<"email" | "guest">(initialTab);
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialAuthMode);
  const emailRef = useRef<HTMLInputElement>(null);

  // Fills in the remembered email once the Email tab's input is mounted (imperatively, via
  // ref — not React state, so there's no server/client markup to reconcile and nothing to
  // hydrate around). Skipped when the server already handed back a specific email (e.g.
  // after a failed sign-in) — that value takes priority over whatever was last remembered.
  useEffect(() => {
    if (initialEmail || mode !== "email") return;
    const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmail && emailRef.current) emailRef.current.value = savedEmail;
  }, [mode, initialEmail]);

  const rememberEmail = () => {
    if (emailRef.current?.value) localStorage.setItem(EMAIL_STORAGE_KEY, emailRef.current.value);
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
      {googleEnabled && mode === "email" && (
        <>
          <a href="/auth/google" className="btn btn-secondary btn-block" style={{ marginTop: 0 }}>
            <GoogleIcon size={18} />
            Continue with Google
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <hr className="hr" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)" }}>or</span>
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

      {mode === "email" ? (
        <>
          <EmailForm authMode={authMode} emailRef={emailRef} initialEmail={initialEmail} onSubmit={rememberEmail} />

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => setAuthMode((m) => (m === "signup" ? "signin" : "signup"))}
            style={{ marginTop: -4 }}
          >
            {authMode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
            Browse Limbic without creating an account. You can still read, search, and save
            content — switch to the Email tab anytime to keep it under a real account.
          </p>
          <form action={guestSignInAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="si-guest-name">Your name</label>
              <input className="input" id="si-guest-name" name="name" type="text" placeholder="Jamie" autoComplete="name" maxLength={80} required />
            </div>
            <AcceptTermsField id="si-guest-accept-terms" />
            <button type="submit" className="btn btn-primary btn-block">
              Continue as guest
            </button>
          </form>
        </div>
      )}

      {/* Account *creation* takes affirmative assent through AcceptTermsField above. This
          line remains for the two paths that don't render it: signing in to an existing
          account, and "Continue with Google", which leaves for the OAuth redirect rather
          than submitting a form of ours. */}
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0, textAlign: "center" }}>
        By signing in or continuing with Google you agree to our{" "}
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
