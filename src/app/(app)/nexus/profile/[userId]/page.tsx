import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getConnectionStates } from "@/lib/nexus";
import { SPECIALTY_META } from "@/lib/meta";
import { Avatar } from "@/components/Avatar";
import { ConnectButton } from "@/components/ConnectButton";
import { NexusPostCard, type NexusPostData } from "@/components/NexusPostCard";

export default async function NexusProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const person = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, headline: true, bio: true, specialty: true, practiceState: true, nexusOptIn: true },
  });
  const isSelf = person?.id === user.id;
  // A profile only exists in Nexus terms while its owner is opted in — someone who left
  // isn't viewable via a stale link, same as if the account didn't exist.
  if (!person || (!person.nexusOptIn && !isSelf)) notFound();

  const posts = await prisma.nexusPost.findMany({
    where: { authorId: person.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, headline: true } },
      likes: { select: { userId: true } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true } } } },
    },
  });

  const decorated: NexusPostData[] = posts.map((p) => ({
    id: p.id,
    body: p.body,
    sourceUrl: p.sourceUrl,
    sourceLabel: p.sourceLabel,
    createdAt: p.createdAt.toISOString(),
    author: p.author,
    likeCount: p.likes.length,
    likedByMe: p.likes.some((l) => l.userId === user.id),
    comments: p.comments.map((c) => ({ id: c.id, body: c.body, createdAt: c.createdAt.toISOString(), author: c.author })),
  }));

  const connectionState = isSelf ? null : (await getConnectionStates(user.id)).get(person.id) ?? { status: "none" as const };

  return (
    <div className="screen-pad">
      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <Avatar name={person.name} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>{person.name}</div>
            {person.headline && <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{person.headline}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span className="tag tag-neutral">{SPECIALTY_META[person.specialty as keyof typeof SPECIALTY_META]}</span>
              <span className="tag tag-neutral">{person.practiceState}</span>
            </div>
          </div>
          {isSelf ? (
            <Link href="/profile" className="btn btn-secondary">
              Edit profile
            </Link>
          ) : (
            connectionState && <ConnectButton userId={person.id} state={connectionState} />
          )}
        </div>
        {person.bio && <p className="card-body" style={{ marginTop: 12 }}>{person.bio}</p>}
      </div>

      <div className="card-kicker" style={{ marginBottom: 8 }}>
        Posts
      </div>
      {decorated.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>No posts yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {decorated.map((post) => (
            <NexusPostCard key={post.id} post={post} currentUserName={user.name} />
          ))}
        </div>
      )}
    </div>
  );
}
