import Link from "next/link";
import { UsersIcon, BellIcon } from "@/components/icons";

/** Shown in the Home aside instead of NexusSuggestionsCard when the viewer can't see real
 *  Nexus suggestions — either because they haven't opted in yet, or because Nexus itself
 *  is still coming-soon for non-admins (see app/(app)/nexus/layout.tsx, which pass
 *  `nexusSuggestions: null` for every non-admin regardless of their own nexusOptIn value).
 *  `onWaitlist` distinguishes those two cases so an already-opted-in reader sees a
 *  confirmation instead of being asked to join again. */
export function NexusJoinPromptCard({ onWaitlist = false }: { onWaitlist?: boolean }) {
  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {onWaitlist ? (
          <BellIcon size={16} style={{ color: "var(--color-accent)" }} />
        ) : (
          <UsersIcon size={16} style={{ color: "var(--color-accent)" }} />
        )}
        <div className="card-kicker" style={{ margin: 0 }}>
          Nexus
        </div>
      </div>
      {onWaitlist ? (
        <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0 }}>
          Coming soon — you&rsquo;re on the list and we&rsquo;ll let you know when it launches.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
            Connect with other PTs, OTs, and healthcare & wellness professionals.
          </p>
          <Link href="/nexus" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
            Join Nexus
          </Link>
        </>
      )}
    </div>
  );
}
