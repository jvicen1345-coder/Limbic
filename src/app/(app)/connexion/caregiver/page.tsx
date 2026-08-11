import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { DownloadIcon, LockIcon } from "@/components/icons";

const CAREGIVER_MODULES = [
  {
    title: "Safe Transfer Techniques",
    oneLiner: "Learn how to safely assist with transfers from bed, chair, toilet, and car.",
    body: "Learn how to safely assist with transfers from bed, chair, toilet, and car. Reduce injury risk for both the caregiver and the person receiving care.",
    hasDownload: false,
  },
  {
    title: "Fall Prevention in the Home",
    oneLiner: "Room-by-room guidance for identifying and eliminating fall hazards.",
    body: "Room-by-room guidance for identifying and eliminating fall hazards. Practical modifications that make a real difference.",
    hasDownload: false,
  },
  {
    title: "Daily Mobility and Exercise",
    oneLiner: "Simple daily movement routines to maintain strength, balance, and independence.",
    body: "Simple daily movement routines designed to maintain strength, balance, and independence. No equipment required.",
    hasDownload: false,
  },
  {
    title: "Emergency Preparedness",
    oneLiner: "What to do if a fall occurs, and how to help someone up safely.",
    body: "What to do if a fall occurs. How to help someone up safely. When to call for help and what information to have ready.",
    hasDownload: false,
  },
  {
    title: "Home Safety Checklist",
    oneLiner: "A comprehensive room-by-room checklist covering the whole home.",
    body: "A comprehensive room-by-room checklist covering entryways, bathrooms, bedrooms, kitchen, stairs, lighting, and mobility pathways.",
    hasDownload: true,
  },
  {
    title: "When to Call a Physical Therapist",
    oneLiner: "Signs that a professional home safety assessment is needed.",
    body: "Signs that a professional assessment is needed. How to find a qualified home health PT. What to expect from a home safety consultation.",
    hasDownload: false,
  },
] as const;

// Free readers get the first 2 modules fully expandable — the same "preview" shape
// nutrition-paywall/wellness-agent-paywall use elsewhere for a Wellness+ upsell, just without
// a blur (every module's content is still just "coming soon" placeholder text today, so
// there's nothing worth visually obscuring yet — the gate is on the interaction, not the copy).
const FREE_PREVIEW_COUNT = 2;

/** Caregiver Education — the one Connexion Method page open to every signed-in reader, not
 *  LimbicPRO-gated like Protocol/Safety Score. Wellness+ (same isPro || studentTier flag
 *  /wellness/nutrition already uses) unlocks all 6 modules; everyone else gets the first 2
 *  fully and a locked preview of the rest. */
export default async function ConnexionCaregiverPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isWellnessPlus = user.isPro || user.studentTier !== "none";
  const unlockedCount = isWellnessPlus ? CAREGIVER_MODULES.length : FREE_PREVIEW_COUNT;

  return (
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Caregiver Education</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 12px" }}>
        Evidence-based guidance for families and caregivers supporting older adults at home.
      </p>
      <div className="vitals-disclaimer">
        This content is for educational purposes only. Always consult a licensed physical therapist for
        individualized assessment and recommendations.
      </div>

      <div className="connexion-module-list">
        {CAREGIVER_MODULES.map((m, i) =>
          i < unlockedCount ? (
            <details className="connexion-module" key={m.title}>
              <summary>
                <span className="connexion-module-summary-text">
                  <span className="connexion-module-title-row">
                    <span className="connexion-module-title">{m.title}</span>
                    <span className="connexion-badge-soon">Coming soon</span>
                  </span>
                  <p className="connexion-module-desc">{m.oneLiner}</p>
                </span>
              </summary>
              <p className="connexion-module-body">{m.body}</p>
              {m.hasDownload && (
                <button type="button" className="btn btn-secondary" disabled style={{ marginTop: 12 }}>
                  <DownloadIcon size={14} /> Download Checklist
                </button>
              )}
            </details>
          ) : (
            <div className="connexion-module--locked" key={m.title}>
              <span className="connexion-module-summary-text">
                <span className="connexion-module-title-row">
                  <span className="connexion-module-title">{m.title}</span>
                  <span className="connexion-badge-soon">Coming soon</span>
                </span>
                <p className="connexion-module-desc">{m.oneLiner}</p>
              </span>
              <span className="connexion-module-locked-note">
                <LockIcon size={11} /> Wellness+
              </span>
            </div>
          )
        )}
      </div>

      {!isWellnessPlus && (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "-8px 0 24px" }}>
          <Link href="/wellness/membership" style={{ color: "var(--color-migration-gold)", fontWeight: 600 }}>
            Upgrade to Wellness+
          </Link>{" "}
          to unlock all 6 caregiver education modules.
        </p>
      )}

      <div className="connexion-assessment-card">
        <div className="connexion-assessment-title">Need a Professional Assessment?</div>
        <p className="connexion-assessment-body">
          The Connexion Method offers comprehensive in-home safety assessments in Orange County, California. A
          licensed PT evaluates your home environment and provides a written report with prioritized
          recommendations.
        </p>
        <Link href="/connexion" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          Learn More
        </Link>
      </div>
    </div>
  );
}
