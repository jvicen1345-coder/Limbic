import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { resetPasswordAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Limbic, Reset Password",
  description: "Set a new Limbic password.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; invalid?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  const { token, error, invalid } = await searchParams;

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
        {invalid === "1" || !token ? (
          <>
            <div>
              <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>That link&rsquo;s expired</h1>
              <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
                Password reset links only work once and expire after an hour. Request a new
                one below.
              </p>
            </div>
            <Link href="/forgot-password" className="btn btn-primary btn-block">
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <div>
              <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Set a new password</h1>
              <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
                Choose a password with at least 8 characters.
              </p>
            </div>

            {error === "1" && (
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
                Passwords must match and be at least 8 characters.
              </p>
            )}

            <form action={resetPasswordAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input type="hidden" name="token" value={token} />
              <div className="field">
                <label htmlFor="rp-password">New password</label>
                <input
                  className="input"
                  id="rp-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="rp-confirm">Confirm password</label>
                <input
                  className="input"
                  id="rp-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Set new password
              </button>
            </form>
          </>
        )}

        <Link href="/sign-in" style={{ fontSize: 12.5, color: "var(--color-neutral-700)", textAlign: "center" }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
