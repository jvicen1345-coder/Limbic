import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { ProGate } from "@/components/pro/ProGate";
import { GuidelinesLibrary } from "@/components/pro/GuidelinesLibrary";

export default async function ProGuidelinesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Clinical Practice Guidelines</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        APTA and evidence-based clinical practice guidelines, key recommendations at a glance.
      </p>

      {!hasClinicalReferenceAccess(user) ? <ProGate toolName="Clinical Practice Guidelines" /> : <GuidelinesLibrary />}
    </div>
  );
}
