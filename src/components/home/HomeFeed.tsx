import Link from "next/link";
import type { ReactNode } from "react";
import { type ContinueReadingData } from "@/components/ContinueReadingCard";
import { type HomeQuestionData } from "@/components/HomeQuestionCard";
import { HomeFeedAside } from "./HomeFeedAside";
import { HomeFeedInteractive, type HomeFeedPanel } from "./HomeFeedInteractive";
import { HomeTimeZoneCookie } from "./HomeTimeZoneCookie";
import { DailyDashboard, type DailyDashboardData } from "@/components/DailyDashboard";
import { LimbicAgentCard } from "@/components/LimbicAgentCard";
import { BackupSigninBanner } from "@/components/BackupSigninBanner";
import { MigrationReminderBanner } from "@/components/MigrationReminderBanner";
import { GraduationTransitionCard } from "@/components/GraduationTransitionCard";
import { type NexusSuggestion } from "@/components/NexusSuggestionsCard";
import type { DailyInsight } from "@/lib/daily-insight";
import { FoundingFunderBadge } from "@/components/FoundingFunderBadge";
import type { DecoratedArticle } from "@/lib/feed";
import type { LicenseView } from "@/lib/license";
import type { LimbicAgentInsights } from "@/lib/limbic-agent-insights";
import {
  TYPE_TABS,
  selectHomeFeed,
  topicDisplayLabelFor,
  type HomeFeedFilter,
} from "@/lib/home-feed-selection";
import { titleFingerprint } from "@/lib/home-grid-rotation";

/**
 * Signed-in Home — Server Component. Greeting, dashboard, and aside are rendered to HTML
 * here. Each tab's hero pool and grid *articles* are selected here too (selectHomeFeed
 * already dedupes a tab's own hero+grid pair against each other), but handed to
 * HomeFeedInteractive as data rather than pre-rendered cards: Refresh pins the old hero in
 * place client-side while swapping in a freshly selected grid, and only the client knows
 * which hero is actually still on screen at that moment — so the final card markup has to
 * be built there, where that check can happen. HomeFeedInteractive is still a Server
 * Component's worth of markup on first load ("use client" doesn't opt a component out of
 * SSR), so this doesn't cost LCP.
 */
export function HomeFeed({
  articles,
  calendarWidget,
  license,
  savedUnread,
  nexusSuggestions,
  showNexus,
  dailyInsight,
  continueReading,
  homeQuestion,
  dashboard,
  foundingFunderNumber,
  hiddenWidgets,
  limbicAgentInsights,
  isPro,
  gridSeenFingerprints,
  showBackupSigninBanner,
  showMigrationReminderBanner,
  showGraduationTransitionCard,
  getTheAppDismissed,
  topicParam = null,
}: {
  articles: DecoratedArticle[];
  /** Server-rendered — see components/LimbicCalendarWidget.tsx. */
  calendarWidget: ReactNode;
  license: LicenseView | null;
  savedUnread: DecoratedArticle[];
  /** null when the viewer hasn't opted into Nexus yet — renders an invitation instead of
   *  a list of people they can't act on. */
  showNexus: boolean;
  dailyInsight: DailyInsight | null;
  nexusSuggestions: NexusSuggestion[] | null;
  /** null when there's no reading history yet. */
  continueReading: ContinueReadingData | null;
  homeQuestion: HomeQuestionData;
  dashboard: DailyDashboardData;
  /** null when the reader isn't a confirmed Founding Funder, or has turned their badge off. */
  foundingFunderNumber: number | null;
  /** Sidebar widget ids the reader has hidden — see lib/home-widgets.ts. */
  hiddenWidgets: string[];
  limbicAgentInsights: LimbicAgentInsights;
  isPro: boolean;
  /** Title fingerprints of articles the grid has already shown since last Refresh. */
  gridSeenFingerprints: string[];
  showBackupSigninBanner: boolean;
  showMigrationReminderBanner: boolean;
  showGraduationTransitionCard: boolean;
  getTheAppDismissed: boolean;
  /** From /home?topic=<slug> (Limbic Agent gap-topic links) — read on the server so this
   *  tree never calls useSearchParams (which would CSR-bailout the whole page). */
  topicParam?: string | null;
}) {
  const showWidget = (id: string) => !hiddenWidgets.includes(id);
  const topicDisplayLabel = topicDisplayLabelFor(articles, topicParam);

  const panels = Object.fromEntries(
    TYPE_TABS.map((tab) => {
      const selection = selectHomeFeed({
        articles,
        filter: tab.id,
        topicParam,
        gridSeenFingerprints,
      });
      const emptyMessage =
        selection.heroPool.length === 0 && selection.gridArticles.length === 0
          ? selection.filtered.length === 0
            ? "No stories in this category yet."
            : "Nothing with a picture in this category yet, try refreshing."
          : null;
      const panel: HomeFeedPanel = {
        heroPool: selection.heroPool,
        gridArticles: selection.gridArticles,
        gridFingerprints: selection.gridArticles.map((a) => titleFingerprint(a.title)),
        emptyMessage,
      };
      return [tab.id, panel] as const;
    }),
  ) as Record<HomeFeedFilter, HomeFeedPanel>;

  return (
    <>
      <HomeTimeZoneCookie />
      <HomeFeedInteractive
        topicParam={topicParam}
        topicDisplayLabel={topicDisplayLabel}
        panels={panels}
        getTheAppDismissed={getTheAppDismissed}
        header={
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 26, margin: 0 }}>{dashboard.greeting}</h1>
              {foundingFunderNumber != null && (
                <Link href="/founding-funders" style={{ textDecoration: "none" }}>
                  <FoundingFunderBadge number={foundingFunderNumber} numberOnly />
                </Link>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 2 }}>{dashboard.dateLabel}</div>
            {license && license.cePercent < 100 && (
              <Link
                href="/profile"
                className={license.statusClass}
                style={{ display: "inline-flex", marginTop: 8, textDecoration: "none" }}
              >
                {license.daysLeftLabel} · {license.ceRequiredTotal - license.ceCompletedTotal} hrs CE left
              </Link>
            )}
          </>
        }
        banners={
          <>
            {showBackupSigninBanner && <BackupSigninBanner />}
            {showGraduationTransitionCard && <GraduationTransitionCard />}
            {showMigrationReminderBanner && <MigrationReminderBanner />}
          </>
        }
        dashboard={<DailyDashboard data={dashboard} />}
        agent={<LimbicAgentCard insights={limbicAgentInsights} isPro={isPro} />}
        aside={
          <HomeFeedAside
            showWidget={showWidget}
            continueReading={continueReading}
            homeQuestion={homeQuestion}
            savedUnread={savedUnread}
            calendarWidget={calendarWidget}
            nexusSuggestions={nexusSuggestions}
            showNexus={showNexus}
            dailyInsight={dailyInsight}
          />
        }
      />
    </>
  );
}
