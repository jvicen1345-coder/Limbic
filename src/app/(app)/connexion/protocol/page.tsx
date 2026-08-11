import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LockIcon } from "@/components/icons";

const PROTOCOL_STEPS = [
  {
    name: "Intake",
    description:
      "Your PT starts by reviewing your medical history and any referral information. Together you'll talk through your goals — whether that's staying safe at home, recovering from surgery, or supporting a family member.",
  },
  {
    name: "Standardized Assessment",
    description:
      "A structured physical assessment that looks at how you move, your balance, your strength, and your endurance. This gives your PT a clear picture of where you are today.",
  },
  {
    name: "Home Walkthrough",
    description:
      "Your PT walks through every room with you — entryways, bathrooms, bedroom, kitchen, stairs. They're looking at the environment through the eyes of someone who knows exactly where falls happen and why.",
  },
  {
    name: "Risk Scoring",
    description:
      "Everything observed gets translated into your Connexion Safety Score — a clear, objective summary of your risk level across three domains: your environment, your mobility, and your fall risk factors.",
  },
  {
    name: "Written Report",
    description:
      "You receive a professional written report after your visit. It summarizes what was found, prioritizes what matters most, and gives you a clear action plan — not just a list of problems.",
  },
  {
    name: "Equipment Recommendations",
    description:
      "If equipment would help — grab bars, a shower bench, a walker, a ramp — your PT tells you exactly what, where, and how to get it. No guessing, no upselling.",
  },
  {
    name: "Caregiver Training",
    description:
      "If a family member or caregiver is present, your PT works with them directly — safe transfer techniques, fall response, daily mobility support. The people around you are part of the plan.",
  },
  {
    name: "Follow-Up Visit",
    description:
      "A follow-up visit confirms that recommendations were implemented, reassesses your goals, and measures your progress. This is where the plan becomes reality.",
  },
] as const;

/** LimbicPRO-only — non-PRO readers get the same locked-state-with-upgrade-prompt shell as
 *  /wellness/agent (see .wellness-agent-paywall), just gold instead of that page's own
 *  --color-migration-gold usage (same token, so this isn't even a new color, just a second
 *  page using it). Reframed from a clinical reference into a plain-language walkthrough of
 *  what a client experiences during a Connexion Method visit — the step names are unchanged,
 *  but PROTOCOL_STEPS' descriptions above speak to the patient/family reading this, not a
 *  clinician (see the original clinical-language versions in git history if that's ever
 *  needed again). */
export default async function ConnexionProtocolPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>What to Expect During Your Visit</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
          Every Connexion Method assessment follows the same eight-step process — so you always know what&rsquo;s
          happening and why.
        </p>
        <div className="wellness-agent-paywall">
          <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>Available with LimbicPRO</div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 18px", maxWidth: 380 }}>
            The Connexion Protocol — Bettie Vicencio, PT&rsquo;s eight-step process for a home safety and mobility
            visit — is included with LimbicPRO.
          </p>
          <Link href="/pro" className="btn btn-primary">
            Upgrade to LimbicPRO
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>What to Expect During Your Visit</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Every Connexion Method assessment follows the same eight-step process — so you always know what&rsquo;s
        happening and why.
      </p>

      <div className="connexion-step-list">
        {PROTOCOL_STEPS.map((step, i) => (
          <div className="connexion-step-card" key={step.name}>
            <span className="connexion-step-number">{i + 1}</span>
            <div className="connexion-step-body">
              <div className="connexion-step-name">{step.name}</div>
              <p className="connexion-step-desc">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="connexion-assessment-card">
        <div className="connexion-assessment-title">Ready to schedule your visit?</div>
        <Link href="/connexion" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          Book Your Assessment
        </Link>
      </div>
    </div>
  );
}
