import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { buildLicenseView } from "@/lib/license";
import { SPECIALTIES, TYPES } from "@/lib/meta";
import { allKnownKeywordTopics } from "@/lib/news-live";
import { buildReadingCalendarWeeks } from "@/lib/reading-calendar";
import type { CeCategory } from "@/lib/types";
import { ProfileForm } from "@/components/ProfileForm";
import { TopicChip } from "@/components/TopicChip";
import { TopicBrowser } from "@/components/TopicBrowser";
import { ReadingCalendar } from "@/components/ReadingCalendar";
import { goAddLicenseAction } from "@/app/actions/profile";
import { optInToNexusAction, leaveNexusAction } from "@/app/actions/nexus";

const READING_CALENDAR_WINDOW_DAYS = 365;

// The canonical specialty/type labels, always shown first — clean and stable, unlike the
// long tail of keyword topics below, which come from a fixed vocabulary rather than
// whatever's currently loaded (see allKnownKeywordTopics).
const SUGGESTED_TOPICS = [...SPECIALTIES.map((s) => s.label), ...TYPES.map((t) => t.label)];
const BROWSABLE_TOPICS = allKnownKeywordTopics().filter((t) => !SUGGESTED_TOPICS.includes(t));

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const followedTopics = user.followedTopics as unknown as string[];

  const license = user.licenseNumber
    ? buildLicenseView(
        user.licenseNumber,
        user.licenseState ?? "",
        user.licenseExpiration ?? new Date(),
        user.ceCategories as unknown as CeCategory[]
      )
    : null;

  const streakDays = user.streakDays;

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - (READING_CALENDAR_WINDOW_DAYS - 1));
  const readRows = await prisma.readArticle.findMany({
    where: { userId: user.id, createdAt: { gte: windowStart } },
    select: { createdAt: true },
  });
  const readingWeeks = buildReadingCalendarWeeks(readRows.map((r) => r.createdAt));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 18px" }}>Profile</h1>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>
            {streakDays > 0 ? `${streakDays}-day reading streak` : "Reading activity"}
          </div>
          <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Last 365 days</span>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: "2px 0 12px" }}>
          {streakDays > 0 ? "Read an article today to keep it going." : "Read an article to start a streak."}
        </p>
        <ReadingCalendar weeks={readingWeeks} />
      </div>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">About you</div>
        <ProfileForm
          name={user.name}
          specialty={user.specialty}
          practiceState={user.practiceState}
          headline={user.headline ?? ""}
          bio={user.bio ?? ""}
        />
      </div>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">Nexus</div>
        {user.nexusOptIn ? (
          <>
            <p className="card-body" style={{ marginTop: 6 }}>
              You&rsquo;re part of Nexus — visible in the directory and reachable for connection
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
        )}
      </div>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">Followed topics</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Tap a topic to prioritize it in your home feed.
        </p>

        <div
          style={{
            fontSize: 11,
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
            fontSize: 11,
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

      <div className="card elev-sm">
        <div className="card-kicker">License & CE</div>
        {license ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 8 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>{license.licenseNumber}</div>
                <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                  {license.licenseState} · Expires {license.expirationLabel}
                </div>
              </div>
              <span className={license.statusClass}>{license.status}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 10 }}>{license.daysLeftLabel}</div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>
                  CE credits
                </span>
                <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                  {license.ceCompletedTotal} / {license.ceRequiredTotal} hrs
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: "var(--color-accent)", width: `${license.cePercent}%` }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              {license.ceCats.map((c) => (
                <div key={c.name}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5 }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
                      {c.completed} / {c.required} hrs
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: "var(--color-neutral-200)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, background: "var(--color-accent-2)", width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="card-body" style={{ marginTop: 8 }}>
              Add your license to track renewal dates and CE requirements.
            </p>
            <form action={goAddLicenseAction}>
              <button type="submit" className="btn btn-secondary" style={{ marginTop: 8 }}>
                Add license
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
