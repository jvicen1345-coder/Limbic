import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { STATES } from "@/lib/meta";
import { signInAction, signInGuestAction } from "@/app/actions/auth";
import { LogoIcon } from "@/components/icons";

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <form
        action={signInAction}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <LogoIcon size={24} />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 21 }}>Limbic</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 4px" }}>
          Sign in with your license to track renewals and CE requirements alongside your feed.
        </p>

        <div className="field">
          <label htmlFor="li-number">License number</label>
          <input className="input" id="li-number" name="number" placeholder="PT-48213" />
        </div>
        <div className="field">
          <label htmlFor="li-state">Issuing state</label>
          <select className="input" id="li-state" name="state" defaultValue="California">
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="li-email">Email</label>
          <input className="input" id="li-email" name="email" type="email" placeholder="you@clinic.com" />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Sign in
        </button>
        <button type="submit" formAction={signInGuestAction} className="btn btn-ghost btn-block">
          Continue as guest
        </button>
        <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: 0, textAlign: "center" }}>
          Demo sign-in — any license number works.
        </p>
      </form>
    </div>
  );
}
