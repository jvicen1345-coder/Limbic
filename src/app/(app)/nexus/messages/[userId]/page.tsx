import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ArrowLeftIcon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { MessageThread } from "@/components/MessageThread";

export default async function NexusMessageThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const connection = await prisma.connection.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: user.id, recipientId: userId },
        { requesterId: userId, recipientId: user.id },
      ],
    },
  });
  if (!connection) notFound();

  const other = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, headline: true } });
  if (!other) notFound();

  const messages = await prisma.nexusMessage.findMany({
    where: {
      OR: [
        { senderId: user.id, recipientId: userId },
        { senderId: userId, recipientId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.nexusMessage.updateMany({
    where: { senderId: userId, recipientId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="screen-pad" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 32px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Link href="/nexus/messages" className="btn btn-ghost btn-icon" aria-label="Back to messages">
          <ArrowLeftIcon size={18} />
        </Link>
        <Avatar name={other.name} size={36} />
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{other.name}</div>
          {other.headline && <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>{other.headline}</div>}
        </div>
      </div>

      <MessageThread
        otherUserId={other.id}
        currentUserId={user.id}
        initialMessages={messages.map((m) => ({ id: m.id, body: m.body, senderId: m.senderId, createdAt: m.createdAt.toISOString() }))}
      />
    </div>
  );
}
