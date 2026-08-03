import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { buildArticleView } from "@/lib/article-view";
import { ArticleThreadsSplitView } from "@/components/ArticleThreadsSplitView";

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ threads?: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const [view, { threads }] = await Promise.all([buildArticleView(id, user.id), searchParams]);
  if (!view) notFound();

  return <ArticleThreadsSplitView initialView={view} isPro={user.isPro} initialAutoExpand={threads === "1"} />;
}
