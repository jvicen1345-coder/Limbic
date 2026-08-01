import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ensureNexusSeedData } from "@/lib/nexus-seed";
import { NexusTabs } from "@/components/NexusTabs";
import { NexusPostCard, type NexusPostData } from "@/components/NexusPostCard";
import { NexusComposer } from "@/components/NexusComposer";

export default async function NexusFeedPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await ensureNexusSeedData();

  const posts = await prisma.nexusPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: { select: { id: true, name: true, headline: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
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
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      author: c.author,
    })),
  }));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Nexus</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        A feed for PTs, OTs, and the wider healthcare & wellness community.
      </p>
      <NexusTabs />

      <NexusComposer />

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
        {decorated.map((post) => (
          <NexusPostCard key={post.id} post={post} currentUserName={user.name} />
        ))}
      </div>
    </div>
  );
}
