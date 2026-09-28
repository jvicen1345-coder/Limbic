import { notFound } from "next/navigation";
import { getCurrentUser, isAdminEmail, hasClinicalReferenceAccess } from "@/lib/session";
import { buildArticleView } from "@/lib/article-view";
import { ArticleThreadsSplitView } from "@/components/ArticleThreadsSplitView";
import type { BreakdownAudience } from "@/lib/article-breakdown-shared";

/** Students start on the student reading of a study and the general public on the patient
 *  one; everyone else, and anyone with no role yet, on the clinician takeaway. */
function audienceForRole(role: string | null): BreakdownAudience {
  if (role === "pts") return "student";
  if (role === "general") return "patient";
  return "clinician";
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
  const view = await buildArticleView(id, user.id, isAdmin);
  if (!view) notFound();

  return (
    <ArticleThreadsSplitView
      initialView={view}
      isPro={user.isPro}
      hasResearchAccess={hasClinicalReferenceAccess(user)}
      defaultAudience={audienceForRole(user.userRole)}
    />
  );
}
