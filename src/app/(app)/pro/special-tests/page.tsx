import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { FreeToolBanner } from "@/components/pro/FreeToolBanner";
import { SpecialTestsLibrary } from "@/components/pro/SpecialTestsLibrary";

export const metadata: Metadata = {
  title: "Special Tests",
};

export default async function ProSpecialTestsPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { region } = await searchParams;

  return (
    <div className="screen-pad pro-wide-page">
      <FreeToolBanner isPro={user.isPro} />
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Special Tests Library</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Organized by body region, with performance technique, positive finding, and diagnostic accuracy.
      </p>

      <SpecialTestsLibrary initialRegionId={region ?? null} />
    </div>
  );
}
