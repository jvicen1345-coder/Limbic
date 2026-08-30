import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { FreeToolBanner } from "@/components/pro/FreeToolBanner";
import { ClinicalReferenceTabs } from "@/components/pro/ClinicalReferenceTabs";
import { getCalculatorProfilesForCurrentUser } from "@/app/actions/calculator-profiles";

export const metadata: Metadata = {
  title: "Clinical Reference",
};

export default async function ProClinicalReferencePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profiles = await getCalculatorProfilesForCurrentUser();

  return (
    <div className="screen-pad">
      <FreeToolBanner isPro={user.isPro} />
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Clinical Reference</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Outcome measures, decision rules, red flag screening, special tests, lab values, medications, and
        terminology — every free clinical-reference tool in one place.
      </p>

      <ClinicalReferenceTabs initialProfiles={profiles} />
    </div>
  );
}
