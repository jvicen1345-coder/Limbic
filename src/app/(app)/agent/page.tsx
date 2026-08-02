import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { CrownIcon } from "@/components/icons";
import { AgentClient } from "@/components/AgentClient";

export default async function AgentPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
        <CrownIcon size={32} style={{ color: "var(--color-accent)", margin: "0 auto 12px" }} />
        <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Limbic Agent is a LimbicPro feature</h1>
        <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
          A living clinical reasoning web — ask a question or describe a case and Limbic Agent grows an
          interactive map of considerations, findings, and evidence as you explore it.
        </p>
        <Link href="/pro" className="btn btn-primary">
          See LimbicPro
        </Link>
      </div>
    );
  }

  return <AgentClient />;
}
