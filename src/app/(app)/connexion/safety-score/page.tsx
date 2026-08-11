import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { ConnexionScheduleSection } from "@/components/connexion/ConnexionScheduleSection";
import { LockIcon } from "@/components/icons";

const DOMAINS = [
  { name: "Environmental Risk", description: "Home layout, lighting, flooring, and accessibility hazards." },
  { name: "Mobility and Balance", description: "Functional mobility, gait, and balance testing results." },
  { name: "Fall Risk Factors", description: "History of falls, medications, and vision/vestibular factors." },
  { name: "Caregiver Support", description: "Availability, training, and capacity of the caregiving network." },
];

/** LimbicPRO-only, same locked-state shell as /connexion/protocol — but even past that gate,
 *  the calculator itself doesn't exist yet (the scoring rubric is still being developed), so
 *  PRO readers land on a second, different "coming soon" state instead of a working tool. */
export default async function ConnexionSafetyScorePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Connexion Safety Score</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
          A proprietary scoring system combining environmental, medical, and mobility risk factors into a single
          actionable assessment.
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
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Connexion Safety Score</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        A proprietary scoring system combining environmental, medical, and mobility risk factors into a single
        actionable assessment.
      </p>

      <div className="card elev-sm connexion-coming-soon-card" style={{ marginBottom: 24 }}>
        <div className="connexion-coming-soon-title">Connexion Safety Score Calculator</div>
        <p className="connexion-coming-soon-body">
          The scoring rubric is currently being developed and validated. The calculator will launch alongside the
          full Connexion Method certification program.
        </p>

        <div className="connexion-domain-grid">
          {DOMAINS.map((d) => (
            <div className="connexion-domain-card" key={d.name}>
              <div className="connexion-domain-card-top">
                <LockIcon size={14} />
                <span className="connexion-badge-soon">Coming soon</span>
              </div>
              <div className="connexion-domain-name">{d.name}</div>
              <p className="connexion-domain-desc">{d.description}</p>
            </div>
          ))}
        </div>
      </div>

      <ConnexionScheduleSection />
    </div>
  );
}
