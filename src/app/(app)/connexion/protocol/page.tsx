import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LockIcon } from "@/components/icons";

const PROTOCOL_STEPS = [
  {
    name: "Intake",
    description: "Referral review. Medical and functional history. Identification of patient and caregiver goals.",
  },
  {
    name: "Standardized Assessment",
    description: "Functional mobility testing. Balance and fall risk screening. Strength, endurance, and environmental assessment.",
  },
  {
    name: "Home Walkthrough",
    description: "Room-by-room hazard identification. Accessibility review. Evaluation of transfers, stairs, bathrooms, and entrances.",
  },
  {
    name: "Risk Scoring",
    description: "Proprietary Connexion Safety Score combining environmental, medical, and mobility risk factors.",
  },
  {
    name: "Written Report",
    description: "Professional summary of findings. Prioritized recommendations. Action plan for patient and family.",
  },
  {
    name: "Equipment Recommendations",
    description: "Durable medical equipment decision-making. Adaptive equipment and home modification guidance. Vendor and installation recommendations.",
  },
  {
    name: "Caregiver Training",
    description: "Safe transfer techniques. Fall recovery strategies. Daily mobility and exercise instruction. Emergency preparedness.",
  },
  {
    name: "Follow-Up Visit",
    description: "Reassessment of goals. Verification of implementation. Outcome measurement and ongoing recommendations.",
  },
] as const;

const DIAGNOSIS_PROTOCOLS = [
  "Parkinson's Disease",
  "Total Hip Arthroplasty",
  "Congestive Heart Failure",
  "Falls and Balance",
  "Deconditioning",
];

/** LimbicPRO-only — non-PRO readers get the same locked-state-with-upgrade-prompt shell as
 *  /wellness/agent (see .wellness-agent-paywall), just gold instead of that page's own
 *  --color-migration-gold usage (same token, so this isn't even a new color, just a second
 *  page using it). */
export default async function ConnexionProtocolPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>The Connexion Protocol</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
          A standardized eight-step clinical process for comprehensive senior home safety and mobility assessment.
        </p>
        <div className="wellness-agent-paywall">
          <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>Available with LimbicPRO</div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 18px", maxWidth: 380 }}>
            The Connexion Protocol — a standardized eight-step clinical process developed by a licensed PT with 30
            years of home health experience — is included with LimbicPRO.
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
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>The Connexion Protocol</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        A standardized eight-step clinical process for comprehensive senior home safety and mobility assessment.
      </p>

      <div className="connexion-step-list">
        {PROTOCOL_STEPS.map((step, i) => (
          <div className="connexion-step-card" key={step.name}>
            <span className="connexion-step-number">{i + 1}</span>
            <div className="connexion-step-body">
              <div className="connexion-step-name">{step.name}</div>
              <p className="connexion-step-desc">{step.description}</p>
              <span className="connexion-badge-soon">Protocol content being finalized</span>
            </div>
          </div>
        ))}
      </div>

      <div className="connexion-assessment-card">
        <div className="connexion-assessment-title">Diagnosis-Specific Protocols — Coming Soon</div>
        <p className="connexion-assessment-body">
          Detailed clinical protocols for Parkinson&rsquo;s disease, total hip arthroplasty, congestive heart
          failure, falls and balance disorders, and general deconditioning. Currently in development.
        </p>
        <div className="connexion-tag-row">
          {DIAGNOSIS_PROTOCOLS.map((d) => (
            <span key={d} className="connexion-tag">
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
