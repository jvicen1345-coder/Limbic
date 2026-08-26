import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess, hasLicenseAccess } from "@/lib/session";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { getAptaNewsArticles } from "@/lib/articles";
import { SPECIALTY_META } from "@/lib/meta";
import { AppShell } from "@/components/AppShell";
import { OnboardingRoleModal } from "@/components/OnboardingRoleModal";
import { zoneTwoOrder } from "@/lib/user-role";
import { getClinicMembershipInfo } from "@/app/actions/clinic-pro";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.hasOnboarded) redirect("/onboarding");
  // "Before they reach /home" — blocks every route in the app, not just Home, since Home is
  // simply the first one a new account would otherwise land on. No sidebar, no AppShell at
  // all until this resolves (see components/OnboardingRoleModal.tsx).
  if (!user.hasCompletedOnboarding) return <OnboardingRoleModal />;

  const [aptaArticles, savedCount, nexusRequestCount, isAdmin, clinicMembership] = await Promise.all([
    getAptaNewsArticles(),
    prisma.savedArticle.count({ where: { userId: user.id } }),
    prisma.connection.count({ where: { recipientId: user.id, status: "pending" } }),
    isSiteAdmin(),
    getClinicMembershipInfo(),
  ]);

  const hasLicense = hasLicenseAccess(user);

  // Same "since you were last here" cutoff the Home feed's own New badges use (see
  // lib/session.ts recordHomeVisit/lib/feed.ts isNew) — the nav badge's job is "how many
  // News items appeared since your last visit," not "how many exist right now," so a
  // reader who's already seen all of today's articles doesn't keep seeing a stuck count.
  const sinceVisit = user.lastVisitedAt?.getTime() ?? 0;
  const newAptaCount = aptaArticles.filter((a) => new Date(a.date).getTime() > sinceVisit).length;

  return (
    <AppShell
      profileName={user.name}
      specialtyLabel={SPECIALTY_META[user.specialty as keyof typeof SPECIALTY_META]}
      practiceState={user.practiceState}
      school={user.school}
      hasLicense={hasLicense}
      isPro={user.isPro}
      isStudent={hasStudentAccess(user)}
      isVerifiedStudent={user.studentTier === "limbicStudent"}
      isAdmin={isAdmin}
      aptaCount={newAptaCount}
      nexusRequestCount={nexusRequestCount}
      savedCount={savedCount}
      zoneTwoOrder={zoneTwoOrder(user.userRole)}
      clinicMembership={clinicMembership}
    >
      {children}
    </AppShell>
  );
}
