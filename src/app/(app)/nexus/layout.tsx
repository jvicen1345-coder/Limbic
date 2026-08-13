import { getCurrentUser, isAdminEmail } from "@/lib/session";
import { optInToNexusAction, leaveNexusAction } from "@/app/actions/nexus";
import { BellIcon, CheckCircleIcon } from "@/components/icons";

/** Gates the entire Nexus section behind a "coming soon" screen for everyone except site
 *  admins (see lib/session.ts isAdminEmail) — Nexus itself isn't launched yet, so nothing
 *  under /nexus (feed, directory, connections, messages, a profile) renders for a regular
 *  reader no matter which of those they navigate to; they see this same waitlist screen in
 *  its place. Reuses the exact opt-in/leave mechanism the real "join Nexus" flow already
 *  had (user.nexusOptIn, optInToNexusAction/leaveNexusAction) — a reader who opts in here
 *  to be notified is, functionally, already a Nexus member the moment this gate is
 *  eventually removed for everyone, no separate waitlist table needed. Admins bypass this
 *  entirely and always see the real, live Nexus. */
export default async function NexusLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
  if (isAdmin) return <>{children}</>;

  return (
    <div className="screen-pad" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
      {user.nexusOptIn ? (
        <>
          <CheckCircleIcon size={32} style={{ color: "var(--color-success)", margin: "0 auto 12px" }} />
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>You&rsquo;re on the list</h1>
          <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
            Nexus, a networking space for PTs, OTs, and the wider healthcare & wellness
            community, is coming soon. We&rsquo;ll let you know the moment it&rsquo;s
            live.
          </p>
          <form action={leaveNexusAction}>
            <button type="submit" className="btn btn-secondary">
              Remove me from the list
            </button>
          </form>
        </>
      ) : (
        <>
          <BellIcon size={32} style={{ color: "var(--color-accent)", margin: "0 auto 12px" }} />
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Nexus is coming soon</h1>
          <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
            A networking space for PTs, OTs, and the wider healthcare & wellness community,
            a directory to find other clinicians, connections, a feed, and direct
            messaging. We&rsquo;re still building it.
          </p>
          <div className="card elev-sm" style={{ textAlign: "left", marginBottom: 20 }}>
            <div className="card-kicker">When it launches</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: "var(--color-neutral-700)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Your name and profile appear in the Nexus directory</li>
              <li>Other members can send you a connection request</li>
              <li>You can post to the feed and message people you&rsquo;re connected with</li>
            </ul>
          </div>
          <form action={optInToNexusAction}>
            <button type="submit" className="btn btn-primary btn-block">
              Notify me when it launches
            </button>
          </form>
        </>
      )}
    </div>
  );
}
