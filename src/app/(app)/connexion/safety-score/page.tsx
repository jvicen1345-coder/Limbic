import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LockIcon } from "@/components/icons";

// TODO: Add AFIT scoring ranges when rubric is finalized
// TODO: Replace placeholder with Delia's scoring rubric when provided
// Contact: Delia Vicencio, PT, DPT — The Connexion Method
const FUNCTIONAL_MOBILITY_ITEMS = ["Posture", "Flexibility", "Strength", "Balance", "Endurance"];

// TODO: Add environmental scoring weights when rubric is finalized
// TODO: Replace placeholder with Delia's scoring rubric when provided
// Contact: Delia Vicencio, PT, DPT — The Connexion Method
const HOME_ENVIRONMENT_ITEMS = ["Entryway", "Bathroom", "Bedroom", "Kitchen", "Stairs", "Lighting", "Mobility Pathways"];

// TODO: Add medical risk scoring weights when rubric is finalized
// TODO: Replace placeholder with Delia's scoring rubric when provided
// Contact: Delia Vicencio, PT, DPT — The Connexion Method
const MEDICAL_RISK_ITEMS = ["Prior Falls", "Medications", "Medical History", "Vision", "Caregiver Support"];

const SCORE_DOMAINS = [
  {
    name: "Functional Mobility",
    description:
      "Based on AFIT results — posture, flexibility, strength, balance, and endurance findings from your in-home assessment.",
    items: FUNCTIONAL_MOBILITY_ITEMS,
  },
  {
    name: "Home Environment",
    description:
      "Based on the room-by-room home walkthrough — hazard identification across entryways, bathrooms, bedroom, kitchen, stairs, lighting, and mobility pathways.",
    items: HOME_ENVIRONMENT_ITEMS,
  },
  {
    name: "Medical and Fall Risk Factors",
    description: "Based on medical history, current medications, prior fall history, and caregiver support levels.",
    items: MEDICAL_RISK_ITEMS,
  },
];

const RISK_LEVELS = ["Low Risk", "Moderate Risk", "Elevated Risk", "High Risk"];

/** LimbicPRO-only, same locked-state shell as /connexion/protocol. Past that gate, this is a
 *  real (placeholder) calculator structure — three scoring domains, each with its own
 *  greyed-out row inputs, and a score output card — ready for Delia's rubric to be dropped
 *  in (see the TODO comments above SCORE_DOMAINS' item lists and above the output card
 *  below), not a generic "coming soon" message like the previous version of this page. */
export default async function ConnexionSafetyScorePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Connexion Safety Score</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
          A proprietary risk assessment combining functional findings, home environment, and medical history to
          predict the likelihood of a fall or injury.
        </p>
        <div className="wellness-agent-paywall">
          <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>Available with LimbicPRO</div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 18px", maxWidth: 380 }}>
            The Connexion Safety Score — a proprietary risk assessment developed by a licensed PT with 30 years of
            home health experience — is included with LimbicPRO.
          </p>
          <Link href="/pro" className="btn btn-primary">
            Upgrade to LimbicPRO
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Connexion Safety Score</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 6px" }}>
        A proprietary risk assessment combining functional findings, home environment, and medical history to
        predict the likelihood of a fall or injury.
      </p>
      <p style={{ fontSize: 12, color: "var(--color-migration-gold)", fontWeight: 600, margin: "0 0 22px" }}>
        Administered by a licensed Connexion Method PT during your home visit.
      </p>

      <h2 style={{ fontSize: 17, margin: "0 0 14px" }}>How the Score Works</h2>
      <div className="connexion-score-domain-grid">
        {SCORE_DOMAINS.map((d) => (
          <div className="connexion-score-domain-card" key={d.name}>
            <div className="connexion-score-domain-name">{d.name}</div>
            <p className="connexion-score-domain-desc">{d.description}</p>
            <span className="connexion-badge-soon">Scoring rubric in development</span>
            <div className="connexion-score-row-list">
              {d.items.map((item) => (
                <div className="connexion-score-row" key={item}>
                  <span className="connexion-score-row-label">{item}</span>
                  <input
                    className="connexion-score-row-input"
                    value="—"
                    disabled
                    readOnly
                    aria-label={`${item} score — available after your visit`}
                  />
                </div>
              ))}
            </div>
            <p className="connexion-score-row-note">Available after your visit</p>
          </div>
        ))}
      </div>

      {/* TODO: Wire scoring logic when rubric is provided by Delia */}
      {/* TODO: Replace placeholder with Delia's scoring rubric when provided */}
      {/* Contact: Delia Vicencio, PT, DPT — The Connexion Method */}
      <div className="connexion-score-output-card">
        <div className="connexion-score-output-title">Connexion Safety Score</div>
        <div className="connexion-score-circle" aria-hidden="true">
          —
        </div>
        <div className="connexion-score-risk-row">
          {RISK_LEVELS.map((r) => (
            <span key={r} className="connexion-score-risk-pill">
              {r}
            </span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, textAlign: "center", maxWidth: 620, margin: "18px auto 30px" }}>
        Your Connexion Safety Score is calculated by a licensed PT during your home visit. The score combines your
        AFIT functional findings, home environment assessment, and medical risk factors into a single predictive
        index.
      </p>

      <div className="connexion-assessment-card">
        <div className="connexion-assessment-title">Get Your Connexion Safety Score</div>
        <p className="connexion-assessment-body">
          The only way to receive your score is through a Connexion Method home visit with a licensed PT.
        </p>
        <Link href="/connexion" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          Schedule Your Visit
        </Link>
      </div>
    </div>
  );
}
