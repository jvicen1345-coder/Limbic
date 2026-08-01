import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getAptaNewsArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [aptaArticles, savedCount] = await Promise.all([
    getAptaNewsArticles(),
    prisma.savedArticle.count({ where: { userId: user.id } }),
  ]);

  const hasLicense = !!user.licenseNumber;

  return (
    <AppShell
      profileName={user.name}
      specialtyLabel={SPECIALTY_META[user.specialty as keyof typeof SPECIALTY_META]}
      practiceState={user.practiceState}
      hasLicense={hasLicense}
      isPro={user.isPro}
      aptaCount={aptaArticles.length}
      savedCount={savedCount}
    >
      {children}
    </AppShell>
  );
}
