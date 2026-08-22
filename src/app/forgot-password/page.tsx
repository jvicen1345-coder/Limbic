import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { requestPasswordResetAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Limbic, Forgot Password",
  description: "Reset your Limbic password.",
};

/** Same route for an ordinary "I forgot my password" and a legacy (pre-passwordHash)
 *  account's first-ever password — see requestPasswordResetAction in app/actions/auth.ts,
 *  which always redirects here with sent=1 regardless of whether the email is registered,
 *  so this page can't be used to test which addresses have an account. */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; rate_limited?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  const { sent, rate_limited } = await searchParams;

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
        <div>
          <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Reset your password</h1>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
            Enter your account email and we&rsquo;ll send a link to set a new password.
          </p>
        </div>

        {rate_limited === "1" && (
          <p
            style={{
              fontSize: 12.5,
              color: "var(--color-danger)",
              background: "color-mix(in srgb, var(--color-danger) 12%, var(--color-surface))",
              border: "1px solid color-mix(in srgb, var(--color-danger) 35%, transparent)",
              borderRadius: "var(--radius-md)",
              padding: "8px 14px",
              margin: 0,
            }}
          >
            Too many reset attempts. Please try again later.
          </p>
        )}

        {sent === "1" ? (
          <p
            style={{
              fontSize: 12.5,
              color: "var(--color-success)",
              background: "color-mix(in srgb, var(--color-success) 12%, var(--color-surface))",
              border: "1px solid color-mix(in srgb, var(--color-success) 35%, transparent)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              margin: 0,
            }}
          >
            If that email has a Limbic account, we&rsquo;ve sent a link to set a new password.
            It expires in an hour.
          </p>
        ) : (
          <form action={requestPasswordResetAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="fp-email">Email</label>
              <input
                className="input"
                id="fp-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Send reset link
            </button>
          </form>
        )}

        <Link href="/sign-in" style={{ fontSize: 12.5, color: "var(--color-neutral-700)", textAlign: "center" }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
