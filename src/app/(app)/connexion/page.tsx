import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { ConnexionScheduleSection } from "@/components/connexion/ConnexionScheduleSection";
import { HeartIcon, FileTextIcon, ActivityIcon, LockIcon } from "@/components/icons";

const AUDIENCE = [
  "Seniors aging independently at home",
  "Adult children planning for a parent's safety",
  "Patients recovering after hospitalization",
  "Home care and caregiving agencies",
  "Realtors serving senior clients",
  "Elder law and estate planning attorneys",
  "Contractors specializing in accessibility",
  "Physical therapists seeking certification",
];

/** The Connexion Method hub — a partner program between Limbic and a proprietary senior
 *  home safety/mobility system developed by Delia Vicencio, PT, DPT (bio at
 *  /connexion/delia). Public to every signed-in reader (unlike Protocol/Safety Score below
 *  it in the sidebar, which are LimbicPRO-gated on their own pages) — this page just links
 *  out to those, showing a lock badge on the two PRO features rather than gating itself. */
export default async function ConnexionOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad page-enter" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="connexion-hero">
        <h1 className="connexion-hero-title">The Connexion Method</h1>
        <p className="connexion-hero-subtitle">
          A standardized, evidence-based system for senior home safety, mobility optimization, and fall prevention,
          designed to document the risk factors present in a home today and support recovery after an event.
        </p>
        <p className="connexion-hero-partner">
          A Limbic partner program, developed by{" "}
          <Link href="/connexion/delia" style={{ color: "var(--color-migration-gold)" }}>
            Delia Vicencio, PT, DPT
          </Link>
        </p>
      </div>

      <div className="connexion-mission-card">
        <div className="connexion-mission-kicker">Mission</div>
        <p className="connexion-mission-text">
          To improve the safety, independence, and quality of life of older adults by delivering a standardized,
          evidence-based home mobility and safety system, one that surfaces the fall and injury risk factors already
          present in a home so they can be addressed, and guides recovery when an event does occur.
        </p>
      </div>

      <div className="connexion-feature-grid">
        <div className="connexion-feature-card">
          <HeartIcon size={22} style={{ color: "var(--color-migration-gold)", marginBottom: 12 }} />
          <div className="connexion-feature-title">Caregiver Education</div>
          <p className="connexion-feature-body">
            Practical guidance for families and caregivers, safe transfers, fall prevention, daily mobility, and
            emergency preparedness.
          </p>
          <Link href="/connexion/caregiver" className="btn btn-secondary">
            Explore
          </Link>
        </div>

        <div className="connexion-feature-card">
          <FileTextIcon size={22} style={{ color: "var(--color-migration-gold)", marginBottom: 12 }} />
          {!user.isPro && (
            <span className="connexion-feature-lock">
              <LockIcon size={10} /> LimbicPRO
            </span>
          )}
          <div className="connexion-feature-title">The Connexion Protocol</div>
          <p className="connexion-feature-body">
            A standardized eight-step clinical process for evaluating and optimizing safety, mobility, and recovery
            in the home environment.
          </p>
          <Link href="/connexion/protocol" className="btn btn-secondary">
            View Protocol
          </Link>
        </div>

        <div className="connexion-feature-card">
          <ActivityIcon size={22} style={{ color: "var(--color-migration-gold)", marginBottom: 12 }} />
          {!user.isPro && (
            <span className="connexion-feature-lock">
              <LockIcon size={10} /> LimbicPRO
            </span>
          )}
          <div className="connexion-feature-title">Connexion Safety Score</div>
          <p className="connexion-feature-body">
            A proprietary scoring system that combines functional assessment findings, environmental factors, and
            medical history to predict the likelihood of a fall or injury, giving clinicians and families a clear,
            actionable risk picture.
          </p>
          <Link href="/connexion/safety-score" className="btn btn-secondary">
            Calculate Score
          </Link>
        </div>
      </div>

      <h2 style={{ fontSize: 19, margin: "0 0 14px" }}>Who The Connexion Method Serves</h2>
      <div className="connexion-audience-grid">
        {AUDIENCE.map((a) => (
          <div key={a} className="connexion-audience-tag">
            {a}
          </div>
        ))}
      </div>

      <ConnexionScheduleSection />
    </div>
  );
}
