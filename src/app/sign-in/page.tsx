import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { googleSignInEnabled } from "@/lib/google-oauth";
import { SignInForm } from "@/components/SignInForm";

// Was falling back to the root layout's generic metadata (see app/layout.tsx) — see
// /founding-funders' own metadata export for why every publicly indexable route
// (sitemap.ts/robots.ts list all five) gets one instead.
export const metadata: Metadata = {
  title: "Limbic, Sign In",
  description: "Sign in to Limbic to access current physical therapy research, clinical tools, and your professional community.",
};

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet.",
  google_denied: "Sign-in with Google was canceled.",
  google_state_mismatch: "That Google sign-in link expired, please try again.",
  google_failed: "Something went wrong signing in with Google. Please try again.",
  invalid_credentials: "Incorrect email or password.",
  // Every account created before real passwords existed (see User.passwordHash) hits this
  // on its first sign-in attempt post-launch — routed to the same "Forgot password?" link
  // below rather than a separate migration flow.
  needs_password: "This account hasn't set a password yet — use “Forgot password?” below to set one.",
  signup_exists: "An account with that email already exists — sign in instead.",
  weak_password: "Password must be at least 8 characters.",
  password_mismatch: "Those passwords don't match.",
  guest_rate_limited: "Too many guest sign-ins from this network recently — please try again later, or create a real account.",
  rate_limited: "Too many attempts. Please try again later.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string; wiped?: string; email?: string; mode?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  const { error, deleted, wiped, email, mode } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? null) : null;
  const successMessage = deleted === "1"
    ? "Your account and all its data have been permanently deleted."
    : wiped === "1"
      ? "All accounts and their data have been permanently wiped."
      : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--color-bg)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand lockup, not a responsive content image */}
      <img src="/logo-lockup.svg" alt="Limbic, Curated Research" width={194} height={70} />
      <p
        style={{
          fontSize: 13,
          color: "var(--color-neutral-700)",
          textAlign: "center",
          maxWidth: 280,
          margin: "-8px 0 4px",
        }}
      >
        Empowering clinicians with personalized knowledge to advance healthcare.
      </p>
      {errorMessage && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--color-danger)",
            background: "color-mix(in srgb, var(--color-danger) 12%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-danger) 35%, transparent)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            maxWidth: 380,
            width: "100%",
            boxSizing: "border-box",
            textAlign: "center",
            margin: 0,
          }}
        >
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--color-success)",
            background: "color-mix(in srgb, var(--color-success) 12%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-success) 35%, transparent)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            maxWidth: 380,
            width: "100%",
            boxSizing: "border-box",
            textAlign: "center",
            margin: 0,
          }}
        >
          {successMessage}
        </p>
      )}
      <SignInForm
        googleEnabled={googleSignInEnabled()}
        initialEmail={email ?? ""}
        initialAuthMode={mode === "signup" ? "signup" : "signin"}
      />
    </div>
  );
}
