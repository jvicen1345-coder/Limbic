import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { firstName } from "@/lib/meta";

export interface AtriumFriend {
  id: string;
  name: string;
}

/** The literal answer to "make the Atrium feel like walking into a room full of friends" —
 *  everything else on this page (streak, calendar, resource cards) is the reader working
 *  alone, so this is the one place the Atrium shows actual people: the reader's accepted
 *  Nexus connections (see lib/nexus.ts getAcceptedConnectionIds), reusing the same Avatar
 *  initials-circle Nexus itself uses so a face here looks like the same person there. Shown
 *  right under the greeting, before the rotation banner/stat grid, so it's the first thing
 *  after "hello" rather than competing with the streak numbers for attention. `friends` is
 *  already capped by the caller (see app/(app)/student/page.tsx) — `totalCount` is the real,
 *  uncapped count, so "+N more" stays accurate even past that cap. */
export function AtriumFriendsStrip({ friends, totalCount }: { friends: AtriumFriend[]; totalCount: number }) {
  if (friends.length === 0) {
    return (
      <div className="atrium-friends-strip atrium-friends-strip--empty">
        <p className="atrium-friends-empty-title">Nobody&rsquo;s here yet</p>
        <p className="atrium-friends-empty-desc">
          Add classmates from Nexus and this space starts feeling like your own study group, not just a dashboard.
        </p>
        <div className="atrium-friends-empty-actions">
          <Link href="/student/study" className="btn btn-secondary">
            Find a Study Buddy
          </Link>
          <Link href="/nexus/directory" className="atrium-friends-empty-link">
            Browse the directory →
          </Link>
        </div>
      </div>
    );
  }

  const extra = totalCount - friends.length;

  return (
    <div className="atrium-friends-strip">
      <span className="atrium-friends-label">Your People</span>
      <div className="atrium-friends-row">
        {friends.map((f) => (
          <Link key={f.id} href={`/nexus/profile/${f.id}`} className="atrium-friend" title={f.name}>
            <Avatar name={f.name} size={36} />
            <span className="atrium-friend-name">{firstName(f.name)}</span>
          </Link>
        ))}
        <Link href="/nexus/connections" className="atrium-friend atrium-friend--more">
          <span className="atrium-friend-more-circle">{extra > 0 ? `+${extra}` : "→"}</span>
          <span className="atrium-friend-name">See all</span>
        </Link>
      </div>
    </div>
  );
}
