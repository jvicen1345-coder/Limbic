import Link from "next/link";
import { UsersIcon } from "@/components/icons";

/** Shown in the Home aside instead of NexusSuggestionsCard when the viewer hasn't opted
 *  into Nexus yet — an invitation rather than a list of people they can't actually act on. */
export function NexusJoinPromptCard() {
  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <UsersIcon size={16} style={{ color: "var(--color-accent)" }} />
        <div className="card-kicker" style={{ margin: 0 }}>
          Nexus
        </div>
      </div>
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
        Connect with other PTs, OTs, and healthcare & wellness professionals.
      </p>
      <Link href="/nexus" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
        Join Nexus
      </Link>
    </div>
  );
}
