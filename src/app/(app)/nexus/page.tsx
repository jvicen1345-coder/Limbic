import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ensureNexusSeedData } from "@/lib/nexus-seed";

export const metadata: Metadata = {
  title: "Feed",
};
import { NEXUS_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";
import { NexusPostCard, type NexusPostData } from "@/components/NexusPostCard";
import { NexusComposer } from "@/components/NexusComposer";
import { getFoundingFunderStatus } from "@/lib/founding-funders";
import { visibleContentWhere } from "@/lib/copyright";

export default async function NexusFeedPage({ searchParams }: { searchParams: Promise<{ tags?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [, { tags: tagsParam }] = await Promise.all([ensureNexusSeedData(), searchParams]);
  const filterTags = tagsParam
    ? tagsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const [posts, currentUserFoundingFunder] = await Promise.all([
    prisma.nexusPost.findMany({
      where: { ...visibleContentWhere },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        author: {
          select: { id: true, name: true, headline: true, foundingFunderBadgeHidden: true, foundingFunder: { select: { paymentStatus: true } } },
        },
        likes: { select: { userId: true } },
        comments: {
          where: { ...visibleContentWhere },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, foundingFunderBadgeHidden: true, foundingFunder: { select: { paymentStatus: true } } } },
          },
        },
      },
    }),
    getFoundingFunderStatus(user.id),
  ]);

  let decorated: NexusPostData[] = posts.map((p) => ({
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

  // Arriving from a Limbic Threads "Nexus Discussion" node (see lib/threads.ts
  // nexusHref) — same case-insensitive substring match against body+articleTitle as that
  // node's own preview match, just applied across the whole fetched page instead of
  // stopping at the first hit.
  if (filterTags.length > 0) {
    const needles = filterTags.map((t) => t.toLowerCase());
    decorated = decorated.filter((p) => {
      const haystack = `${p.body} ${p.articleTitle ?? ""}`.toLowerCase();
      return needles.some((n) => haystack.includes(n));
    });
  }

  return (
    <div className="screen-pad nexus-feed-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Nexus</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        A feed for PTs, OTs, and the wider healthcare & wellness community.
      </p>
      <SubTabs tabs={NEXUS_TABS} />

      {filterTags.length > 0 && (
        <div
          className="card elev-sm"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 14,
            background: "var(--color-accent-100)",
            border: "1px solid var(--color-accent-300)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--color-accent-800)" }}>
            Showing discussions related to {filterTags.join(", ")}, {decorated.length}{" "}
            {decorated.length === 1 ? "post" : "posts"}
          </span>
          <Link href="/nexus" className="btn btn-ghost">
            Show all
          </Link>
        </div>
      )}

      <NexusComposer authorName={user.name} />

      {filterTags.length > 0 && decorated.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)", marginTop: 14 }}>
          No discussions on this topic yet, be the first to start one above.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
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
