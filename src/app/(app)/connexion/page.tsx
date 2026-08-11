import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getConnexionWaitlistCount } from "@/app/actions/connexion";
import { ConnexionWaitlistForm } from "@/components/connexion/ConnexionWaitlistForm";
import { HeartIcon, FileTextIcon, ActivityIcon, LockIcon } from "@/components/icons";

const AUDIENCE = [
  "Older adults aging at home",
  "Adult children of aging parents",
  "Home care agencies",
  "Realtors working with seniors",
  "Elder law attorneys",
  "Rehabilitation professionals",
];

/** The Connexion Method hub — a partner program between Limbic and a proprietary senior
 *  home safety/mobility system developed by Bettie Vicencio, PT. Public to every signed-in
 *  reader (unlike Protocol/Safety Score below it in the sidebar, which are LimbicPRO-gated
 *  on their own pages) — this page just links out to those, showing a lock badge on the two
 *  PRO features rather than gating itself. */
export default async function ConnexionOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const waitlistCount = await getConnexionWaitlistCount();

  return (
    <div className="screen-pad" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="connexion-hero">
        <h1 className="connexion-hero-title">The Connexion Method</h1>
        <p className="connexion-hero-subtitle">
          A standardized, evidence-based system for senior home safety, mobility optimization, and post-hospital
          recovery — developed by a licensed physical therapist with 30 years of home health experience.
        </p>
        <p className="connexion-hero-partner">A Limbic partner program — developed by Bettie Vicencio, PT</p>
      </div>

      <div className="connexion-mission-card">
        <div className="connexion-mission-kicker">Mission</div>
        <p className="connexion-mission-text">
          To improve the safety, independence, and quality of life of older adults by delivering a standardized,
          evidence-based home mobility and safety system that can be consistently implemented by trained clinicians.
        </p>
      </div>

      <div className="connexion-feature-grid">
        <div className="connexion-feature-card">
          <HeartIcon size={22} style={{ color: "var(--color-migration-gold)", marginBottom: 12 }} />
          <div className="connexion-feature-title">Caregiver Education</div>
          <p className="connexion-feature-body">
            Practical guidance for families and caregivers — safe transfers, fall prevention, daily mobility, and
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
            A proprietary scoring system that combines environmental, medical, and mobility risk factors into a
            single actionable assessment.
          </p>
          <Link href="/connexion/safety-score" className="btn btn-secondary">
            Calculate Score
          </Link>
        </div>
      </div>

      <h2 style={{ fontSize: 19, margin: "0 0 14px" }}>Who The Connexion Method Serves</h2>
      <div className="connexion-audience-grid">
        {AUDIENCE.map((a) => (
          <span key={a} className="connexion-audience-tag">
            {a}
          </span>
        ))}
      </div>

      <div className="connexion-cta-card">
        <div className="connexion-cta-title">Become a Connexion Certified Provider</div>
        <p className="connexion-cta-body">
          Training and certification coming soon. Join the waitlist to be notified when the Connexion Method
          certification program launches.
        </p>
        <ConnexionWaitlistForm initialCount={waitlistCount} />
        <p className="connexion-cta-fineprint">For licensed physical therapists and rehabilitation professionals</p>
      </div>
    </div>
  );
}
