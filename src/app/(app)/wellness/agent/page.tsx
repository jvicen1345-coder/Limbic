import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getWellnessProfile } from "@/lib/wellness-profile";
import { WellnessAgentChat } from "@/components/WellnessAgentChat";
import { LockIcon } from "@/components/icons";

export default async function WellnessAgentPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const eligible = user.isWellnessPlus || user.isPro;

  if (!eligible) {
    return (
      <div className="screen-pad" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Agent Wellness</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
          Evidence based wellness guidance, powered by current PT research.
        </p>
        <div className="wellness-agent-paywall">
          <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>Available with Limbic Wellness+</div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 18px", maxWidth: 380 }}>
            Chat with Limbic Agent Wellness for personalized exercise and nutrition guidance, grounded in current PT research, included
            with LimbicWellness+ or LimbicPRO.
          </p>
          <Link href="/wellness/membership" className="btn btn-primary">
            Upgrade to Wellness+
          </Link>
        </div>
      </div>
    );
  }

  const profile = await getWellnessProfile(user.id);

  return (
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Agent Wellness</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Evidence based wellness guidance, powered by current PT research.
      </p>
      <div className="vitals-disclaimer">
        Limbic Agent Wellness provides general health and wellness recommendations only. Always consult your physician or a licensed
        physical therapist before starting any new exercise or nutrition program to ensure it is appropriate for you. Limbic Agent never
        diagnoses and never prescribes.
      </div>

      <WellnessAgentChat initialGoal={profile?.wellnessGoal ?? null} />
    </div>
  );
}
