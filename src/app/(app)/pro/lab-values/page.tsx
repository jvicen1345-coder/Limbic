import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { FreeToolBanner } from "@/components/pro/FreeToolBanner";
import { ClinicalReferenceTabs } from "@/components/pro/ClinicalReferenceTabs";

export const metadata: Metadata = {
  title: "Clinical Reference",
};

export default async function ProClinicalReferencePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <FreeToolBanner isPro={user.isPro} />
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Clinical Reference</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Lab values and medication classes relevant to PT practice, with normal ranges and clinical implications for
        each.
      </p>

      <ClinicalReferenceTabs />
    </div>
  );
}
