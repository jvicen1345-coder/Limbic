import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { ConnexionScheduleSection } from "@/components/connexion/ConnexionScheduleSection";
import { ArrowLeftIcon } from "@/components/icons";

const CREDENTIALS = [
  "Licensed Physical Therapist — California",
  "30+ years of home health and outpatient experience",
  "Founder of The Connexion Method",
];

/** Bio page for The Connexion Method's founder — linked from the "developed by Bettie
 *  Vicencio, PT" line on /connexion and from its own sidebar entry. Every section below is
 *  placeholder content pending real material from Bettie herself (see the TODO comments) —
 *  the page ships now so the link target and layout exist, not because the bio is finished. */
export default async function ConnexionBettiePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Link
        href="/connexion"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-neutral-700)", textDecoration: "none", marginBottom: 16 }}
      >
        <ArrowLeftIcon size={14} /> Back to The Connexion Method
      </Link>

      <div className="connexion-bettie-header">
        {/* TODO: Add photo when available */}
        <div className="connexion-bettie-avatar" aria-hidden="true">
          BV
        </div>
        <div>
          <h1 className="connexion-bettie-name">Bettie Vicencio, PT</h1>
          <p className="connexion-bettie-subtitle">Licensed Physical Therapist — 30 Years of Home Health Experience</p>
          <p className="connexion-bettie-location">Orange County, California</p>
        </div>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 20 }}>
        <div className="card-title">About Bettie</div>
        {/* TODO: Bettie to provide biography text */}
        <p className="card-body" style={{ marginTop: 8 }}>Content coming soon — biography and clinical background will be added here.</p>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 20 }}>
        <div className="card-title">Credentials and Experience</div>
        {/* TODO: Bettie to confirm full credential list */}
        <ul className="connexion-credential-list">
          {CREDENTIALS.map((c) => (
            <li key={c} className="connexion-credential-item">
              {c}
            </li>
          ))}
          <li className="connexion-credential-item">
            Additional credentials
            <span className="connexion-badge-soon">Coming soon</span>
          </li>
        </ul>
      </div>

      <div className="connexion-mission-card" style={{ marginBottom: 20 }}>
        <div className="connexion-mission-kicker">Founder of The Connexion Method</div>
        <p className="connexion-mission-text" style={{ marginBottom: 14 }}>
          The Connexion Method is a standardized, evidence-based system for senior home safety, mobility
          optimization, and post-hospital recovery — developed from 30 years of direct patient care.
        </p>
        <Link href="/connexion" className="btn btn-primary">
          Learn About The Connexion Method
        </Link>
      </div>

      <ConnexionScheduleSection />
    </div>
  );
}
