import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getAcceptedConnectionIds } from "@/lib/nexus";

export const metadata: Metadata = {
  title: "Messages",
};
import { timeAgo } from "@/lib/nexus-utils";
import { NEXUS_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";
import { Avatar } from "@/components/Avatar";

export default async function NexusMessagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const connectionIds = await getAcceptedConnectionIds(user.id);
  const people = connectionIds.length
    ? await prisma.user.findMany({
        where: { id: { in: connectionIds } },
        select: { id: true, name: true, headline: true },
      })
    : [];

  const conversations = await Promise.all(
    people.map(async (person) => {
      const lastMessage = await prisma.nexusMessage.findFirst({
        where: {
          OR: [
            { senderId: user.id, recipientId: person.id },
            { senderId: person.id, recipientId: user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      const unread = lastMessage?.recipientId === user.id && !lastMessage.readAt;
      return { person, lastMessage, unread };
    })
  );

  conversations.sort((a, b) => {
    const at = a.lastMessage?.createdAt.getTime() ?? 0;
    const bt = b.lastMessage?.createdAt.getTime() ?? 0;
    return bt - at;
  });

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Nexus</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        A feed for PTs, OTs, and the wider healthcare & wellness community.
      </p>
      <SubTabs tabs={NEXUS_TABS} />

      {conversations.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
          Messaging opens up once you connect with someone; visit the Directory to get started.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {conversations.map(({ person, lastMessage, unread }) => (
            <Link
              key={person.id}
              href={`/nexus/messages/${person.id}`}
              className="card elev-sm"
              style={{ flexDirection: "row", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
            >
              <Avatar name={person.name} size={44} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{person.name}</span>
                  {unread && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--color-accent)" }} />}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--color-neutral-700)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lastMessage ? lastMessage.body : "Say hello, you're connected."}
                </div>
              </div>
              {lastMessage && (
                <span style={{ fontSize: 11, color: "var(--color-neutral-700)", flexShrink: 0 }}>
                  {timeAgo(lastMessage.createdAt)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
