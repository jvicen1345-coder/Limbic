import { getCurrentUser, isStudentEmail } from "@/lib/session";
import {
  subscribeToProAction,
  cancelProAction,
  subscribeToStudentTierAction,
  cancelStudentTierAction,
} from "@/app/actions/pro";
import { CrownIcon, GraduationCapIcon } from "@/components/icons";
import { PRO_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

const STUDENT_TIERS: { id: "studentPro" | "studentProBoards"; name: string; price: string; blurb: string }[] = [
  {
    id: "studentPro",
    name: "Student PRO",
    price: "$5/month",
    blurb: "HEP templates for coursework, the student verified badge, and a coursework-curated weekly roundup.",
  },
  {
    id: "studentProBoards",
    name: "Student PRO+ Boards",
    price: "$15/month",
    blurb: "Everything in Student PRO, plus full access to Limbic Boards — Daily Term and Daily Sharpening.",
  },
];

export default async function ProMembershipPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = isStudentEmail(user.email);

  return (
    <div className="screen-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CrownIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>LimbicPro</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        {user.isPro
          ? "You're a Pro member — thanks for supporting Limbic."
          : "Clinician tools built for how you actually practice — all in the app, nothing emailed out."}
      </p>
      <SubTabs tabs={PRO_TABS} />

      <div className="card elev-sm" style={{ marginBottom: 16 }}>
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
            <div className="card-kicker">$25/month</div>
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

      <div className="card elev-sm">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <GraduationCapIcon size={18} style={{ color: "var(--color-accent)" }} />
          <div className="card-kicker" style={{ margin: 0 }}>
            Student tiers
          </div>
        </div>

        {!student ? (
          <p className="card-body" style={{ marginTop: 6 }}>
            Student PRO and Student PRO+ Boards are only available with a student email —
            sign in on the General tab with an address ending in <strong>.edu</strong> to unlock
            them.
          </p>
        ) : user.studentTier === "none" ? (
          <>
            <p className="card-body" style={{ marginTop: 6 }}>
              Demo only — this doesn&rsquo;t charge a real card. Pick the tier that fits.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {STUDENT_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-neutral-100)",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 14 }}>
                      {tier.name} <span style={{ fontWeight: 400, fontSize: 12 }}>· {tier.price}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "2px 0 0", maxWidth: 420 }}>
                      {tier.blurb}
                    </p>
                  </div>
                  <form action={subscribeToStudentTierAction.bind(null, tier.id)}>
                    <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                      Upgrade
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="card-body" style={{ marginTop: 6 }}>
              You&rsquo;re on{" "}
              {user.studentTier === "studentProBoards" ? "Student PRO+ Boards" : "Student PRO"}.
              {user.studentTier === "studentPro" && " Upgrade any time to add full Limbic Boards access."}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              {user.studentTier === "studentPro" && (
                <form action={subscribeToStudentTierAction.bind(null, "studentProBoards")}>
                  <button type="submit" className="btn btn-primary">
                    Upgrade to Student PRO+ Boards
                  </button>
                </form>
              )}
              <form action={cancelStudentTierAction}>
                <button type="submit" className="btn btn-secondary">
                  Cancel membership
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
