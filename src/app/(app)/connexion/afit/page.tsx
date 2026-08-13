import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

const FUNCTIONAL_QUESTIONS = [
  "How easily can you get up from a chair?",
  "How well can you maintain your balance?",
  "How freely can you move through your daily activities?",
  "How far and comfortably can you walk?",
  "How strong and flexible do you remain?",
  "Can you continue doing the things you love?",
];

const AFIT_GOALS = [
  "Establish a functional baseline",
  "Monitor changes as they age",
  "Reduce preventable functional decline",
  "Improve strength, balance, and mobility",
  "Remain active and independent",
];

const AFIT_DOMAINS = [
  { name: "Posture", description: "Alignment and postural control at rest and in motion" },
  { name: "Flexibility", description: "Range of motion and tissue mobility across key joints" },
  { name: "Strength", description: "Functional strength for daily tasks and fall recovery" },
  { name: "Balance", description: "Static and dynamic balance under real-world conditions" },
  { name: "Endurance", description: "Cardiovascular and muscular endurance for sustained activity" },
];

/** The Adult Functional Independence Test — a performance-based functional assessment
 *  Delia Vicencio, PT, DPT uses (not developed) as part of every Connexion Method visit
 *  (see Step 2 of /connexion/protocol, and the "AFIT" card on /connexion/delia — Delia
 *  founded The Connexion Method itself, but the AFIT is a distinct assessment she applies
 *  within it, not one she authored). Open to every signed-in reader, same as Caregiver
 *  Education — this is educational/marketing content about the assessment itself, not the
 *  proprietary Protocol or Safety Score tool, so it isn't LimbicPRO-gated. */
export default async function ConnexionAfitPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad" style={{ maxWidth: 860, margin: "0 auto" }}>
      <div className="connexion-hero">
        <h1 className="connexion-hero-title">Adult Functional Independence Test</h1>
        <p className="connexion-hero-subtitle" style={{ marginBottom: 4 }}>
          AFIT Functional Wellness Assessment
        </p>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 4px" }}>
          Used by Delia Vicencio, PT, DPT in every Connexion Method assessment, 30 years of home health experience
        </p>
        <p className="connexion-hero-partner">Helping adults stay strong, mobile, and independent as they age.</p>
      </div>

      <div className="connexion-mission-card">
        <p className="connexion-mission-text">
          After more than 30 years as a physical therapist, including extensive experience working with older
          adults and medically complex patients in the home, I have seen firsthand how small changes in strength,
          balance, flexibility, endurance, and mobility can become major problems when they are not recognized
          early. The AFIT provides a structured, performance-based way to identify those changes before they become
          crises.
        </p>
      </div>

      <div className="card elev-sm" style={{ textAlign: "center", padding: "28px 24px", marginBottom: 26 }}>
        <p className="card-body" style={{ margin: "0 auto", maxWidth: 620 }}>
          Don&rsquo;t wait for a fall, hospitalization, or loss of independence to find out that something has
          changed. The AFIT provides a functional snapshot of where you are today and identifies areas that may
          benefit from targeted exercise, lifestyle changes, or further professional evaluation.
        </p>
      </div>

      <h2 style={{ fontSize: 19, margin: "0 0 14px", textAlign: "center" }}>Your Body Has a Functional Story</h2>
      <div className="connexion-question-grid">
        {FUNCTIONAL_QUESTIONS.map((q) => (
          <div key={q} className="connexion-question-card">
            {q}
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "var(--color-migration-gold)", margin: "16px 0 30px" }}>
        These abilities matter. The AFIT measures them.
      </p>

      <h2 style={{ fontSize: 19, margin: "0 0 4px", textAlign: "center" }}>Who Is the AFIT For?</h2>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px", textAlign: "center" }}>
        Adults 50 and older who want to:
      </p>
      <div className="connexion-afit-goal-grid">
        {AFIT_GOALS.map((g) => (
          <div key={g} className="connexion-audience-tag">
            {g}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 19, margin: "36px 0 4px", textAlign: "center" }}>A 30-Minute Functional Snapshot</h2>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 18px", textAlign: "center" }}>
        The AFIT evaluates key components of optimal aging across five domains:
      </p>
      <div className="connexion-afit-domain-grid">
        {AFIT_DOMAINS.map((d) => (
          <div key={d.name} className="connexion-afit-domain-card">
            <div className="connexion-afit-domain-name">{d.name}</div>
            <p className="connexion-afit-domain-desc">{d.description}</p>
          </div>
        ))}
      </div>

      <div className="connexion-cta-card" style={{ marginTop: 30 }}>
        <div className="connexion-cta-title">Don&rsquo;t Just Ask, Am I Healthy?</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-migration-gold)", margin: "0 0 14px" }}>
          Ask: Am I functioning at my best?
        </p>
        <p className="connexion-cta-body">
          The AFIT is conducted by a licensed Doctor of Physical Therapy as part of a Connexion Method home visit.
          This is not a self-assessment; it is a professional evaluation designed to give you a clear, objective
          picture of your functional status.
        </p>
        <p className="connexion-cta-fineprint" style={{ margin: "0 0 20px" }}>
          The AFIT is integrated into every Connexion Method assessment. Results directly inform your Connexion
          Safety Score.
        </p>
        <Link href="/connexion#schedule" className="connexion-visit-button" style={{ display: "inline-block", textDecoration: "none" }}>
          Schedule Your Assessment
        </Link>
      </div>
    </div>
  );
}
