import { redirect } from "next/navigation";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getAptaNewsArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.hasOnboarded) redirect("/onboarding");

  const [aptaArticles, savedCount, nexusRequestCount] = await Promise.all([
    getAptaNewsArticles(),
    prisma.savedArticle.count({ where: { userId: user.id } }),
    prisma.connection.count({ where: { recipientId: user.id, status: "pending" } }),
  ]);

  const hasLicense = !!user.licenseNumber;

  return (
    <AppShell
      profileName={user.name}
      specialtyLabel={SPECIALTY_META[user.specialty as keyof typeof SPECIALTY_META]}
      practiceState={user.practiceState}
      hasLicense={hasLicense}
      isPro={user.isPro}
      isStudent={isStudentEmail(user.email)}
      aptaCount={aptaArticles.length}
      nexusRequestCount={nexusRequestCount}
      savedCount={savedCount}
    >
      {children}
    </AppShell>
  );
}
