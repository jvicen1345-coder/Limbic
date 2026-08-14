import { getCurrentUser } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { SpecialTestsLibrary } from "@/components/pro/SpecialTestsLibrary";

export default async function ProSpecialTestsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Special Tests Library</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Organized by body region, with performance technique, positive finding, and diagnostic accuracy.
      </p>

      {!user.isPro ? <ProGate toolName="Special Tests Library" /> : <SpecialTestsLibrary />}
    </div>
  );
}
