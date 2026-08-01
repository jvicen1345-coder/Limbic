import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { NEXUS_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";
import { Avatar } from "@/components/Avatar";
import { ConnectButton } from "@/components/ConnectButton";
import Link from "next/link";

export default async function NexusConnectionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const connections = await prisma.connection.findMany({
    where: { OR: [{ requesterId: user.id }, { recipientId: user.id }], status: { in: ["pending", "accepted"] } },
    include: {
      requester: { select: { id: true, name: true, headline: true } },
      recipient: { select: { id: true, name: true, headline: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const incoming = connections.filter((c) => c.status === "pending" && c.recipientId === user.id);
  const accepted = connections.filter((c) => c.status === "accepted");

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Nexus</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        A feed for PTs, OTs, and the wider healthcare & wellness community.
      </p>
      <SubTabs tabs={NEXUS_TABS} />

      {incoming.length > 0 && (
        <>
          <div className="card-kicker" style={{ marginBottom: 8 }}>
            Requests
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {incoming.map((c) => {
              const person = c.requester;
              return (
                <div key={c.id} className="card elev-sm" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Link href={`/nexus/profile/${person.id}`} style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}>
                    <Avatar name={person.name} size={44} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{person.name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{person.headline}</div>
                    </div>
                  </Link>
                  <ConnectButton userId={person.id} state={{ status: "pending-incoming", connectionId: c.id }} />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="card-kicker" style={{ marginBottom: 8 }}>
        Your connections
      </div>
      {accepted.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
          No connections yet — visit the Directory to start connecting.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {accepted.map((c) => {
            const person = c.requesterId === user.id ? c.recipient : c.requester;
            return (
              <div key={c.id} className="card elev-sm" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Link href={`/nexus/profile/${person.id}`} style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}>
                  <Avatar name={person.name} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{person.name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{person.headline}</div>
                  </div>
                </Link>
                <ConnectButton userId={person.id} state={{ status: "accepted", connectionId: c.id }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
