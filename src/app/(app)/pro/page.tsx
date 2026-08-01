import { getCurrentUser } from "@/lib/session";
import { subscribeToProAction, cancelProAction } from "@/app/actions/pro";
import { CrownIcon } from "@/components/icons";

const FEATURES: { title: string; description: string; live: boolean }[] = [
  {
    title: "Home Exercise Program exports",
    description: "Export any HEP as a printable PDF, or share it with a patient via a link.",
    live: false,
  },
  {
    title: "Weekly Roundup",
    description: "A dedicated in-app view of the week's top stories from your followed topics — no email, everything stays in Limbic.",
    live: false,
  },
  {
    title: "License renewal alerts",
    description: "An in-app heads-up as your license expiration or CE deadline approaches — no email required.",
    live: false,
  },
];

export default async function ProPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CrownIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>LimbicPro</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        {user.isPro
          ? "You're a Pro member — thanks for supporting Limbic."
          : "Clinician tools built for how you actually practice — all in the app, nothing emailed out."}
      </p>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                className={f.live ? "tag tag-accent" : "tag tag-neutral"}
                style={{ flexShrink: 0, marginTop: 2 }}
              >
                {f.live ? "Live" : "Coming soon"}
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, marginBottom: 2 }}>{f.title}</div>
                <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card elev-sm">
        {user.isPro ? (
          <>
            <div className="card-kicker">Membership</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              You have full access to LimbicPro. Manage or cancel your membership below.
            </p>
            <form action={cancelProAction}>
              <button type="submit" className="btn btn-secondary" style={{ marginTop: 10 }}>
                Cancel membership
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="card-kicker">$9/month</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              Demo only — this doesn&rsquo;t charge a real card. It flips your account to Pro
              instantly; real billing plugs in here once these features ship.
            </p>
            <form action={subscribeToProAction}>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>
                Upgrade to LimbicPro
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
