import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { googleSignInEnabled } from "@/lib/google-oauth";
import { SignInForm } from "@/components/SignInForm";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet.",
  google_denied: "Sign-in with Google was canceled.",
  google_state_mismatch: "That Google sign-in link expired, please try again.",
  google_failed: "Something went wrong signing in with Google. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string; wiped?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  const { error, deleted, wiped } = await searchParams;
  const errorMessage = error ? GOOGLE_ERROR_MESSAGES[error] : null;
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
      <SignInForm googleEnabled={googleSignInEnabled()} />
    </div>
  );
}
