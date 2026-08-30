import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LockIcon } from "@/components/icons";
import { SAFETY_SCORE_DOMAINS, domainMaxScore } from "@/lib/connexion-safety-score";

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  environmental: "A room-by-room home walkthrough — entryway, living areas, bathroom, bedroom, kitchen, and stairs — scoring 25 hazard checkpoints.",
  mobility: "Sit-to-stand, transfers, walking, stairs, device use, and balance during functional tasks, observed directly during your visit.",
  fallRisk: "Fall history, strength, balance, gait, cognition, footwear, and caregiver support — the factors most predictive of a future fall.",
};

const RISK_LEVELS = ["Low Risk", "Moderate Risk", "High Risk", "Very High Risk", "Critical Risk"];

/** LimbicPRO-only, same locked-state shell as /connexion/protocol. Past that gate, this
 *  previews the real Connexion Safety Score rubric — three scoring domains (Environmental
 *  Safety /100, Mobility & Functional Safety /48, Fall-Risk Factors /60, total /208, see
 *  lib/connexion-safety-score.ts, transcribed from Delia Vicencio, PT, DPT's own paper
 *  form) at the domain level only, not the full 52-item breakdown — the score itself is
 *  only ever entered live by a Connexion PT during your visit (see
 *  /admin/connexion-safety-score for that fillable tool). This page is read-only display. */
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
            The Connexion Safety Score, a proprietary risk assessment developed by a licensed PT with 30 years of
            home health experience, is included with LimbicPRO.
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
        {SAFETY_SCORE_DOMAINS.map((d) => (
          <div className="connexion-score-domain-card" key={d.key}>
            <div className="connexion-score-domain-name">
              {d.name} <span style={{ fontWeight: 400, color: "var(--color-neutral-600)" }}>/ {domainMaxScore(d)}</span>
            </div>
            <p className="connexion-score-domain-desc">{DOMAIN_DESCRIPTIONS[d.key]}</p>
            <span className="connexion-badge-soon">Scored during your visit</span>
            <p className="connexion-score-row-note">Available after your visit</p>
          </div>
        ))}
      </div>

      <div className="connexion-score-output-card">
        <div className="connexion-score-output-title">Connexion Safety Score</div>
        <div className="connexion-score-circle" aria-hidden="true">
          N/A
        </div>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>out of 208</p>
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
        environmental safety, functional mobility, and fall-risk findings into a single 0-208 predictive index.
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
