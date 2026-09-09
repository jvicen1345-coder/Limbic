import "@/styles/shell.css";
import "@/styles/tour.css";
import "@/styles/screens.css";
import "@/styles/calendar.css";
import "@/styles/streaks.css";
import "@/styles/onboarding.css";
import "@/styles/programs.css";
import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess, hasLicenseAccess, isAdminEmail } from "@/lib/session";
import { SPECIALTY_META } from "@/lib/meta";
import { AppShell } from "@/components/AppShell";
import { OnboardingRoleModal } from "@/components/OnboardingRoleModal";
import { zoneTwoOrder } from "@/lib/user-role";
import { getClinicMembershipInfo } from "@/app/actions/clinic-pro";
import { TimeZoneSync } from "@/components/TimeZoneSync";
import { TourHost } from "@/components/TourHost";
import { getTimeZone } from "@/lib/user-time-zone";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.hasSetName) redirect("/onboarding/name");
  if (!user.hasOnboarded) redirect("/onboarding");
  // "Before they reach /home" — blocks every route in the app, not just Home, since Home is
  // simply the first one a new account would otherwise land on. No sidebar, no AppShell at
  // all until this resolves (see components/OnboardingRoleModal.tsx).
  if (!user.hasCompletedOnboarding) return <OnboardingRoleModal />;

  // Only data that changes the shell's structure stays on the blocking path. The three
  // numeric badges load after hydration from /api/navigation-badges, so a cold Google News
  // RSS request can never hold up the authenticated shell. Clinic membership still belongs
  // here because it controls which clinic navigation renders; time zone stays because child
  // pages key calendar-day data from the same server value.
  const [clinicMembership, timeZone] = await Promise.all([
    getClinicMembershipInfo(),
    // Resolved here as well as in each page that keys something on a calendar date, so
    // TimeZoneSync below can tell whether the zone the server just rendered against is the
    // one the reader is actually in (see components/TimeZoneSync.tsx).
    getTimeZone(user),
  ]);

  const hasLicense = hasLicenseAccess(user);
  // This is derivable from the already-loaded user. Calling isSiteAdmin() here would read
  // the session again (request-cached now, but still unnecessary work on the hot path).
  const isAdmin = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);

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
      zoneTwoOrder={zoneTwoOrder(user.userRole)}
      clinicMembership={clinicMembership}
    >
      <TimeZoneSync serverTimeZone={timeZone} />
      {/* Mounted for the whole app rather than by Home, which is where it used to live: a
          section tour walks between routes, so the player has to outlive any single page
          (see components/TourHost.tsx). The welcome tour still starts itself only on Home
          and only once — that gate is the prop, not the mount point. */}
      <TourHost autoStartWelcome={!user.hasCompletedTour} />
      {children}
    </AppShell>
  );
}
