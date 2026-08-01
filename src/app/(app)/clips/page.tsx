import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { CLIPS } from "@/lib/clips-static";
import { ClipsFeed } from "@/components/ClipsFeed";

export default async function ClipsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const savedRows = await prisma.savedArticle.findMany({
    where: { userId: user.id },
    select: { articleId: true },
  });
  const savedIds = savedRows.map((r) => r.articleId);

  return <ClipsFeed clips={CLIPS} savedIds={savedIds} />;
}
