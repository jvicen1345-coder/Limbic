import { getCurrentUser } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { OttawaAnkleRule } from "@/components/pro/decision-rules/OttawaAnkleRule";
import { OttawaKneeRule } from "@/components/pro/decision-rules/OttawaKneeRule";
import { CanadianCSpineRule } from "@/components/pro/decision-rules/CanadianCSpineRule";
import { PittsburghKneeRule } from "@/components/pro/decision-rules/PittsburghKneeRule";
import { WellsDvtRule } from "@/components/pro/decision-rules/WellsDvtRule";
import { WellsPeRule } from "@/components/pro/decision-rules/WellsPeRule";
import { CaudaEquinaRule } from "@/components/pro/decision-rules/CaudaEquinaRule";
import { NexusRule } from "@/components/pro/decision-rules/NexusRule";

export default async function ProDecisionRulesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Clinical Decision Rules</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Evidence-based rules to guide clinical reasoning, imaging decisions, referral criteria, and risk
        stratification.
      </p>

      {!user.isPro ? (
        <ProGate toolName="Clinical Decision Rules" />
      ) : (
        <>
          <div className="pro-disclaimer">
            These tools support clinical reasoning. They do not replace clinical judgment or a full patient
            examination.
          </div>
          <div className="pro-accordion">
            <OttawaAnkleRule />
            <OttawaKneeRule />
            <CanadianCSpineRule />
            <PittsburghKneeRule />
            <WellsDvtRule />
            <WellsPeRule />
            <CaudaEquinaRule />
            <NexusRule />
          </div>
        </>
      )}
    </div>
  );
}
