import { getCurrentUser } from "@/lib/session";
import { optInToNexusAction } from "@/app/actions/nexus";
import { UsersIcon } from "@/components/icons";

/** Gates the entire Nexus section behind explicit consent — nothing under /nexus renders
 *  (no directory listing, no posting, no messaging) until the user opts in here. Real
 *  users only ever show up to others once they've done this themselves (see
 *  nexusOptIn on User); seeded profiles are exempt since they can't log in to opt in. */
export default async function NexusLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.nexusOptIn) {
    return (
      <div className="screen-pad" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
        <UsersIcon size={32} style={{ color: "var(--color-accent)", margin: "0 auto 12px" }} />
        <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Join Nexus</h1>
        <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
          A networking space for PTs, OTs, and the wider healthcare & wellness community —
          a directory to find other clinicians, connections, a feed, and direct messaging.
        </p>
        <div className="card elev-sm" style={{ textAlign: "left", marginBottom: 20 }}>
          <div className="card-kicker">Joining means</div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: "var(--color-neutral-700)", display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Your name and profile appear in the Nexus directory</li>
            <li>Other members can send you a connection request</li>
            <li>You can post to the feed and message people you&rsquo;re connected with</li>
          </ul>
        </div>
        <form action={optInToNexusAction}>
          <button type="submit" className="btn btn-primary btn-block">
            Join Nexus
          </button>
        </form>
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", marginTop: 10 }}>
          You can leave anytime from your Profile — that removes your directory listing,
          connections, posts, and messages.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
