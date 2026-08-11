import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { ConnexionScheduleSection } from "@/components/connexion/ConnexionScheduleSection";
import { ArrowLeftIcon } from "@/components/icons";

const CREDENTIALS = [
  "Licensed Physical Therapist — California",
  "Doctor of Physical Therapy",
  "30+ years of home health and outpatient experience",
  "Founder of The Connexion Method",
  "Uses the Adult Functional Independence Test (AFIT) in every assessment",
];

/** Bio page for The Connexion Method's founder — linked from the "developed by Delia
 *  Vicencio, PT, DPT" line on /connexion and from its own sidebar entry. Every section below
 *  is placeholder content pending real material from Delia herself (see the TODO comments) —
 *  the page ships now so the link target and layout exist, not because the bio is finished.
 *  Route is /connexion/delia — was /connexion/bettie before the founder's name was
 *  corrected; see AppShell.tsx and every other Link pointing here for the other half of
 *  that rename. Delia founded The Connexion Method itself, but did NOT develop the AFIT —
 *  she uses it as part of her process (a correction from an earlier draft that credited her
 *  as its developer); see /connexion/afit for the same distinction. */
export default async function ConnexionDeliaPage() {
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

      <div className="connexion-delia-header">
        {/* TODO: Add photo when available */}
        <div className="connexion-delia-avatar" aria-hidden="true">
          DV
        </div>
        <div>
          <h1 className="connexion-delia-name">Delia Vicencio, PT, DPT</h1>
          <p className="connexion-delia-subtitle">
            Licensed Physical Therapist, Doctor of Physical Therapy — 30 Years of Home Health Experience
          </p>
          <p className="connexion-delia-location">Orange County, California</p>
        </div>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 20 }}>
        <div className="card-title">About Delia</div>
        {/* TODO: Delia to review and expand biography */}
        <p className="card-body" style={{ marginTop: 8 }}>
          Delia Vicencio is a licensed physical therapist and Doctor of Physical Therapy with more than 30 years of
          experience working with older adults and medically complex patients in the home. She developed The
          Connexion Method, using the Adult Functional Independence Test as its functional assessment, to bring
          standardized, evidence-based assessment to senior home safety and mobility optimization.
        </p>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 20 }}>
        <div className="card-title">The AFIT — Part of Every Connexion Method Visit</div>
        <p className="card-body" style={{ marginTop: 8, marginBottom: 14 }}>
          The Adult Functional Independence Test is a performance-based functional assessment that Delia
          incorporates into every Connexion Method visit, applying more than 30 years of direct patient care to how
          it&rsquo;s administered. It evaluates posture, flexibility, strength, balance, and endurance — and forms
          the functional foundation of every Connexion Method assessment.
        </p>
        <Link href="/connexion/afit" className="btn btn-secondary" style={{ alignSelf: "flex-start" }}>
          Learn About the AFIT
        </Link>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 20 }}>
        <div className="card-title">Credentials and Experience</div>
        {/* TODO: Delia to confirm full credential list */}
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
          optimization, and fall prevention — developed from 30 years of direct patient care.
        </p>
        <Link href="/connexion" className="btn btn-primary">
          Learn About The Connexion Method
        </Link>
      </div>

      <ConnexionScheduleSection />
    </div>
  );
}
