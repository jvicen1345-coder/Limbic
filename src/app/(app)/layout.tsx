import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles, getUnderReviewArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [articles, reviewArticles, savedCount] = await Promise.all([
    getArticles(),
    getUnderReviewArticles(),
    prisma.savedArticle.count({ where: { userId: user.id } }),
  ]);

  const hasLicense = !!user.licenseNumber;
  const breakingCount = articles.filter((a) => a.breaking).length;
  const reviewCount = reviewArticles.length;

  return (
    <AppShell
      profileName={user.name}
      specialtyLabel={SPECIALTY_META[user.specialty as keyof typeof SPECIALTY_META]}
      practiceState={user.practiceState}
      hasLicense={hasLicense}
      breakingCount={breakingCount}
      reviewCount={reviewCount}
      savedCount={savedCount}
    >
      {children}
    </AppShell>
  );
}
