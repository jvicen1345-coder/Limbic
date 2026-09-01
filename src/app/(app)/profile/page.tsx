import Link from "next/link";
import { getCurrentUser, isStudentEmail, isAdminEmail } from "@/lib/session";
import { prisma } from "@/lib/db";
import { SUGGESTED_TOPICS } from "@/lib/meta";
import { allKnownKeywordTopics } from "@/lib/news-live";
import { ProfileForm } from "@/components/ProfileForm";
import { GetTheAppCard } from "@/components/GetTheAppCard";
import { TopicChip } from "@/components/TopicChip";
import { TopicBrowser } from "@/components/TopicBrowser";
import { ReadingStreakCard } from "@/components/ReadingStreakCard";
import { GamesStreakCard } from "@/components/GamesStreakCard";
import { HomeWidgetToggle } from "@/components/HomeWidgetToggle";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";
import { AccountSecuritySection } from "@/components/AccountSecuritySection";
import { SuggestionBoxCard } from "@/components/SuggestionBoxCard";
import { optInToNexusAction, leaveNexusAction } from "@/app/actions/nexus";
import { HOME_WIDGETS } from "@/lib/home-widgets";
import { PROFILE_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";
import { getFoundingFunderStatus } from "@/lib/founding-funders";
import { FoundingFunderBadge } from "@/components/FoundingFunderBadge";
import { StudentVerifiedBadge } from "@/components/StudentVerifiedBadge";
import { FoundingFunderBadgeCard } from "@/components/FoundingFunderBadgeCard";
import { UserRoleSection } from "@/components/UserRoleSection";
import { isUserRole, type UserRole } from "@/lib/user-role";
import { ThemeSection } from "@/components/ThemeSection";
import { ReplayTourButton } from "@/components/ReplayTourButton";
import { ProgramTimelineSection } from "@/components/ProgramTimelineSection";
import { dateToLocalIso } from "@/lib/limbic-calendar";
import { getUserProgram } from "@/app/actions/dpt-programs";

// The long tail of keyword topics not already covered by SUGGESTED_TOPICS — comes from a
// fixed vocabulary rather than whatever's currently loaded (see allKnownKeywordTopics).
const BROWSABLE_TOPICS = allKnownKeywordTopics().filter((t) => !SUGGESTED_TOPICS.includes(t));

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const followedTopics = user.followedTopics as unknown as string[];
  const hiddenHomeWidgets = user.hiddenHomeWidgets as unknown as string[];

  const isStudent = user.studentTier !== "none";
  // Broader than isStudent above (which is purely the paid studentTier) — ProfileForm's
  // "no license needed" badge should also cover a .edu account that hasn't purchased
  // Limbic Student.
  const isStudentForCredentials = isStudentEmail(user.email) || isStudent;
  const hasFoundingSpot = (await prisma.foundingFunder.count({ where: { userId: user.id } })) > 0;
  // Confirmed-only (unlike hasFoundingSpot above, which also counts a still-pending Stripe
  // Checkout) — the badge under the user's name should only claim membership once it's
  // actually paid for, not the moment someone starts a claim.
  const foundingFunderStatus = await getFoundingFunderStatus(user.id);
  // Nexus isn't launched yet for anyone but site admins (see app/(app)/nexus/layout.tsx,
  // which gates every /nexus route the same way) — this card's copy needs to match that
  // "coming soon" state for everyone else, or "Go to Nexus"/"you're part of Nexus" would
  // be a lie the moment they click through.
  const isAdminUser = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
  const userProgram = isStudent ? await getUserProgram() : null;

  return (
    <div className="screen-pad page-enter">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Profile</h1>
      {isStudent && (
        <div style={{ marginBottom: 8 }}>
          <StudentVerifiedBadge />
        </div>
      )}
      {foundingFunderStatus.isFunder && !user.foundingFunderBadgeHidden && (
        <div style={{ marginBottom: 8 }}>
          <FoundingFunderBadge number={foundingFunderStatus.number} />
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <SubTabs tabs={PROFILE_TABS} />
      </div>

      <div className="profile-header-grid">
        <ReadingStreakCard streakDays={user.streakDays} />
        <GamesStreakCard streakDays={user.gamesStreakDays} />
      </div>

      {foundingFunderStatus.isFunder && (
        <FoundingFunderBadgeCard hidden={user.foundingFunderBadgeHidden} number={foundingFunderStatus.number} />
      )}

      <UserRoleSection role={isUserRole(user.userRole ?? "") ? (user.userRole as UserRole) : null} />

      {isStudent && (
        <ProgramTimelineSection
          userProgram={userProgram}
          dptProgramStart={user.dptProgramStart ?? ""}
          dptGraduation={user.dptGraduation ?? ""}
          npteExamDate={user.npteExamDate ? dateToLocalIso(user.npteExamDate) : ""}
          rotation1={{
            site: user.rotation1Site ?? "",
            city: user.rotation1City ?? "",
            setting: user.rotation1Setting ?? "",
            start: user.rotation1Start ?? "",
            end: user.rotation1End ?? "",
            supervisor: user.rotation1Supervisor ?? "",
          }}
          rotation2={{
            site: user.rotation2Site ?? "",
            city: user.rotation2City ?? "",
            setting: user.rotation2Setting ?? "",
            start: user.rotation2Start ?? "",
            end: user.rotation2End ?? "",
            supervisor: user.rotation2Supervisor ?? "",
          }}
          rotation3={{
            site: user.rotation3Site ?? "",
            city: user.rotation3City ?? "",
            setting: user.rotation3Setting ?? "",
            start: user.rotation3Start ?? "",
            end: user.rotation3End ?? "",
            supervisor: user.rotation3Supervisor ?? "",
          }}
        />
      )}

      <ThemeSection
        initialTheme={
          user.themePreference === "light" || user.themePreference === "dark" ? user.themePreference : "system"
        }
      />

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">Platform Tour</div>
        <p className="card-body" style={{ marginTop: 2, marginBottom: 12 }}>
          Replay the guided tour to rediscover Limbic features.
        </p>
        <ReplayTourButton />
      </div>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">About you</div>
        <ProfileForm
          name={user.name}
          specialty={user.specialty}
          practiceState={user.practiceState}
          school={user.school ?? ""}
          canvasUrl={user.canvasUrl ?? ""}
          clinicName={user.clinicName ?? ""}
          isStudent={isStudentForCredentials}
          isPro={user.isPro}
          headline={user.headline ?? ""}
          bio={user.bio ?? ""}
        />
      </div>

      <GetTheAppCard dismissed={user.getTheAppDismissed} />

      <AccountSecuritySection
        backupEmail={user.backupEmail}
        backupEmailAddedAt={user.backupEmailAddedAt?.toISOString() ?? null}
        isStudent={isStudent}
      />

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">Nexus</div>
        {isAdminUser ? (
          user.nexusOptIn ? (
            <>
              <p className="card-body" style={{ marginTop: 6 }}>
                You&rsquo;re part of Nexus, visible in the directory and reachable for connection
                requests and messages.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link href="/nexus" className="btn btn-secondary">
                  Go to Nexus
                </Link>
                <form action={leaveNexusAction}>
                  <button type="submit" className="btn btn-ghost">
                    Leave Nexus
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p className="card-body" style={{ marginTop: 6 }}>
                Join Nexus to appear in the directory and connect with other PTs, OTs, and
                healthcare & wellness professionals.
              </p>
              <form action={optInToNexusAction}>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                  Join Nexus
                </button>
              </form>
            </>
          )
        ) : user.nexusOptIn ? (
          <>
            <p className="card-body" style={{ marginTop: 6 }}>
              Nexus is coming soon, you&rsquo;re on the list and we&rsquo;ll let you know the
              moment it launches.
            </p>
            <form action={leaveNexusAction}>
              <button type="submit" className="btn btn-ghost" style={{ marginTop: 8 }}>
                Remove me from the list
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="card-body" style={{ marginTop: 6 }}>
              Nexus, a networking space for PTs, OTs, and the wider healthcare & wellness
              community, is coming soon.
            </p>
            <form action={optInToNexusAction}>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Notify me when it launches
              </button>
            </form>
          </>
        )}
      </div>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">Followed topics</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Tap a topic to prioritize it in your home feed.
        </p>

        <div
          style={{
            fontSize: "var(--fs-11)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-neutral-700)",
            marginTop: 14,
            marginBottom: 6,
          }}
        >
          Suggested
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SUGGESTED_TOPICS.map((t) => (
            <TopicChip key={t} topic={t} followed={followedTopics.includes(t)} />
          ))}
        </div>

        <div
          style={{
            fontSize: "var(--fs-11)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-neutral-700)",
            marginTop: 18,
            marginBottom: 6,
          }}
        >
          Add more
        </div>
        <TopicBrowser topics={BROWSABLE_TOPICS} followedTopics={followedTopics} />
      </div>

      <div className="card elev-sm" style={{ marginTop: 18 }}>
        <div className="card-kicker">Home page widgets</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Choose what shows up in the sidebar on your home page.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {HOME_WIDGETS.map((w) => (
            <HomeWidgetToggle key={w.id} id={w.id} label={w.label} visible={!hiddenHomeWidgets.includes(w.id)} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <SuggestionBoxCard />
      </div>

      <DeleteAccountSection hasFoundingSpot={hasFoundingSpot} />
    </div>
  );
}
