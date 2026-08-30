import { getCurrentUser } from "@/lib/session";
import { AgentClient } from "@/components/AgentClient";
import { ProGate } from "@/components/pro/ProGate";

export default async function AgentPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;

  // Inline upsell rather than a hard redirect to /pro — same pattern as CE Tracker/
  // Dashboard/Force Lab (see their own page.tsx files), so a non-Pro visitor actually sees
  // Limbic Agent's specific upsell copy instead of bouncing to the generic overview. The
  // real enforcement layer stays app/actions/agent.ts's own isPro check, since a page gate
  // alone doesn't stop someone from calling the Server Action directly. Limbic Threads' own
  // "Prompt Agent" node (see components/ThreadsWeb.tsx) never gets a viewer here in the
  // first place when they're not Pro — it gates and shows its own upsell in place.
  if (!user.isPro) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Agent</h1>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          Clinical decision support powered by AI. Evidence-based answers at the point of care. Available with
          LimbicPRO — $15/month.
        </p>
        <ProGate toolName="Limbic Agent" />
      </div>
    );
  }

  const { topic } = await searchParams;
  return <AgentClient initialQuestion={topic} />;
}
