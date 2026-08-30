import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { FreeToolBanner } from "@/components/pro/FreeToolBanner";
import { ScreeningDecisionTabs } from "@/components/pro/ScreeningDecisionTabs";

export const metadata: Metadata = {
  title: "Screening & Decision Support",
};

export default async function ProScreeningDecisionPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad pro-wide-page">
      <FreeToolBanner isPro={user.isPro} />
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Screening & Decision Support</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Evidence-based decision rules and red flag screening to guide clinical reasoning, imaging decisions, and
        referral criteria.
      </p>

      <ScreeningDecisionTabs />
    </div>
  );
}
