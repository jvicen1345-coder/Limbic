import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getConnectionStates } from "@/lib/nexus";
import { SPECIALTY_META } from "@/lib/meta";
import { Avatar } from "@/components/Avatar";
import { ConnectButton } from "@/components/ConnectButton";
import { NexusPostCard, type NexusPostData } from "@/components/NexusPostCard";
import { getFoundingFunderStatus } from "@/lib/founding-funders";
import { FoundingFunderBadge } from "@/components/FoundingFunderBadge";

export default async function NexusProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const person = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      headline: true,
      bio: true,
      specialty: true,
      practiceState: true,
      nexusOptIn: true,
      foundingFunderBadgeHidden: true,
    },
  });
  const isSelf = person?.id === user.id;
  // A profile only exists in Nexus terms while its owner is opted in — someone who left
  // isn't viewable via a stale link, same as if the account didn't exist.
  if (!person || (!person.nexusOptIn && !isSelf)) notFound();

  const [posts, personFoundingFunder, currentUserFoundingFunder] = await Promise.all([
    prisma.nexusPost.findMany({
      where: { authorId: person.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, headline: true, foundingFunderBadgeHidden: true, foundingFunder: { select: { paymentStatus: true } } },
        },
        likes: { select: { userId: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, foundingFunderBadgeHidden: true, foundingFunder: { select: { paymentStatus: true } } } },
          },
        },
      },
    }),
    getFoundingFunderStatus(person.id),
    getFoundingFunderStatus(user.id),
  ]);

  const decorated: NexusPostData[] = posts.map((p) => ({
    id: p.id,
    type: p.type,
    body: p.body,
    articleTitle: p.articleTitle,
    imageUrls: (p.imageUrls as string[]) ?? [],
    videoUrl: p.videoUrl,
    sourceUrl: p.sourceUrl,
    sourceLabel: p.sourceLabel,
    createdAt: p.createdAt.toISOString(),
    author: {
      id: p.author.id,
      name: p.author.name,
      headline: p.author.headline,
      isFoundingFunder: p.author.foundingFunder?.paymentStatus === "confirmed" && !p.author.foundingFunderBadgeHidden,
    },
    likeCount: p.likes.length,
    likedByMe: p.likes.some((l) => l.userId === user.id),
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        isFoundingFunder: c.author.foundingFunder?.paymentStatus === "confirmed" && !c.author.foundingFunderBadgeHidden,
      },
    })),
  }));

  const connectionState = isSelf ? null : (await getConnectionStates(user.id)).get(person.id) ?? { status: "none" as const };

  return (
    <div className="screen-pad">
      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <Avatar name={person.name} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>{person.name}</div>
              {personFoundingFunder.isFunder && !person.foundingFunderBadgeHidden && <FoundingFunderBadge />}
            </div>
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
            <NexusPostCard
              key={post.id}
              post={post}
              currentUserName={user.name}
              currentUserIsFoundingFunder={currentUserFoundingFunder.isFunder && !user.foundingFunderBadgeHidden}
            />
          ))}
        </div>
      )}
    </div>
  );
}
