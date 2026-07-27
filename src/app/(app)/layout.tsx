import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [articles, savedCount] = await Promise.all([
    getArticles(),
    prisma.savedArticle.count({ where: { userId: user.id } }),
  ]);

  const hasLicense = !!user.licenseNumber;
  const breakingCount = articles.filter((a) => a.breaking).length;

  return (
    <AppShell
      profileName={user.name}
      specialtyLabel={SPECIALTY_META[user.specialty as keyof typeof SPECIALTY_META]}
      practiceState={user.practiceState}
      hasLicense={hasLicense}
      breakingCount={breakingCount}
      savedCount={savedCount}
    >
      {children}
    </AppShell>
  );
}
