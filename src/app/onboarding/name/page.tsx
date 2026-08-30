import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { completeNameOnboardingAction } from "@/app/actions/onboarding";

const ERROR_MESSAGES: Record<string, string> = {
  name_required: "Please enter both your first and last name to continue.",
};

/** One-time, post-signup screen — the very first gate a brand-new account hits (see
 *  app/(app)/layout.tsx, which redirects any signed-in account with hasSetName false here
 *  before it can reach the topic picker, the role modal, or anything else in the app).
 *  Prefills from whatever User.name already holds (an email-derived guess, a name Google
 *  supplied, or whatever a guest typed at sign-in) so most readers are just confirming
 *  rather than typing from scratch — first token as first name, remainder as last name;
 *  a single-word starting name (e.g. a guest who only typed "Jamie") leaves last name
 *  blank rather than guessing wrong. */
export default async function OnboardingNamePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.hasSetName) redirect("/home");

  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? null) : null;

  const words = user.name.trim().split(/\s+/).filter(Boolean);
  const firstNameDefault = words[0] ?? "";
  const lastNameDefault = words.slice(1).join(" ");

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

      <div className="card elev-md onboarding-card" style={{ maxWidth: 460, width: "100%" }}>
        <div className="card-kicker">Welcome to Limbic</div>
        <div className="card-title">What&rsquo;s your name?</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Let us know who you are before you get started — you can change this anytime from
          Profile.
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
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {errorMessage}
          </p>
        )}

        <form action={completeNameOnboardingAction}>
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="onb-first-name">First name</label>
            <input
              className="input"
              id="onb-first-name"
              name="firstName"
              type="text"
              placeholder="Jane"
              autoComplete="given-name"
              defaultValue={firstNameDefault}
              maxLength={80}
              required
            />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="onb-last-name">Last name</label>
            <input
              className="input"
              id="onb-last-name"
              name="lastName"
              type="text"
              placeholder="Smith"
              autoComplete="family-name"
              defaultValue={lastNameDefault}
              maxLength={80}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
            Continue to Limbic
          </button>
        </form>
      </div>
    </div>
  );
}
