import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { FreeToolBanner } from "@/components/pro/FreeToolBanner";
import { GuidelinesLibrary } from "@/components/pro/GuidelinesLibrary";

export const metadata: Metadata = {
  title: "Guidelines",
};

export default async function ProGuidelinesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <FreeToolBanner isPro={user.isPro} />
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Clinical Practice Guidelines</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        APTA, AAOS, NICE, and other evidence-based clinical practice guidelines, key recommendations at a glance.
      </p>

      <GuidelinesLibrary />
    </div>
  );
}
