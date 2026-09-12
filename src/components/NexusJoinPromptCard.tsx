import Link from "next/link";
import { UsersIcon } from "@/components/icons";

/** Shown in the Home aside instead of NexusSuggestionsCard when the viewer has not joined
 *  Nexus yet. Only readers Nexus exists for get this far (see lib/nexus-visibility.ts —
 *  HomeFeedAside gates the whole slot on showNexus), so "join" is always the honest ask.
 *
 *  It used to take an `onWaitlist` flag that swapped in a "you're on the list, we'll let
 *  you know when it launches" confirmation. That path was unreachable — its one caller
 *  hard-coded false — and the promise was one nothing kept: nexus-visibility.ts is explicit
 *  that Nexus is absent rather than waitlisted, precisely so the app never advertises a
 *  feature that may not ship. */
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
        Connect with other PTs, OTs, and healthcare &amp; wellness professionals.
      </p>
      <Link href="/nexus" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
        Join Nexus
      </Link>
    </div>
  );
}
