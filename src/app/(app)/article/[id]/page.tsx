import { notFound } from "next/navigation";
import { getCurrentUser, isAdminEmail, hasClinicalReferenceAccess } from "@/lib/session";
import { buildArticleView } from "@/lib/article-view";
import { ArticleThreadsSplitView } from "@/components/ArticleThreadsSplitView";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
  const view = await buildArticleView(id, user.id, isAdmin);
  if (!view) notFound();

  return <ArticleThreadsSplitView initialView={view} isPro={user.isPro} hasResearchAccess={hasClinicalReferenceAccess(user)} />;
}
