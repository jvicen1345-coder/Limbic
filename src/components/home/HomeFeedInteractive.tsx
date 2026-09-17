"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon, XIcon, DownloadIcon, RefreshIcon } from "@/components/icons";
import { useStandaloneDisplay } from "@/lib/use-standalone-display";
import { SlidingTabs } from "@/components/SlidingTabs";
import { HeroFeed } from "@/components/HeroFeed";
import { ArticleCard } from "@/components/ArticleCard";
import { RefreshHomeFeedButton } from "@/components/RefreshHomeFeedButton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { refreshHomeFeedAction } from "@/app/actions/home";
import { TYPE_TABS, type HomeFeedFilter } from "@/lib/home-feed-selection";
import { resolveGridArticles } from "@/lib/home-grid-backfill";
import type { DecoratedArticle } from "@/lib/feed";

export type HomeFeedPanel = {
  heroPool: DecoratedArticle[];
  gridArticles: DecoratedArticle[];
  gridBackfill: DecoratedArticle[];
  gridFingerprints: string[];
  emptyMessage: string | null;
};

/**
 * Home's interactive chrome — tabs, topic pill, pull-to-refresh, and Refresh — around
 * server-rendered greeting / dashboard / aside. Default tab content is already in the HTML;
 * switching tabs only toggles which prebuilt panel is visible (same pattern as
 * WellnessOverviewTabs). Hero pools stay as data so Refresh can rotate the grid without
 * replacing the pinned hero. Grid cards are rendered here (not server-built ReactNode) so
 * the active tab's grid can be filtered against whichever hero is actually on screen — see
 * the heroImages check below, which is what stops a rotated-in grid card from repeating the
 * still-pinned hero's picture.
 */
export function HomeFeedInteractive({
  topicParam,
  topicDisplayLabel,
  panels,
  getTheAppDismissed,
  header,
  banners,
  dashboard,
  agent,
  aside,
}: {
  topicParam: string | null;
  topicDisplayLabel: string | null;
  panels: Record<HomeFeedFilter, HomeFeedPanel>;
  getTheAppDismissed: boolean;
  header: ReactNode;
  banners: ReactNode;
  dashboard: ReactNode;
  agent: ReactNode;
  aside: ReactNode;
}) {
  const [filter, setFilter] = useState<HomeFeedFilter>("all");
  const router = useRouter();
  const pathname = usePathname();
  const clearTopicFilter = () => router.replace(pathname);

  const panel = panels[filter];
  const heroPinKey = `${filter}:${topicParam ?? ""}`;
  const [pinnedHeroKey, setPinnedHeroKey] = useState(heroPinKey);
  const [pinnedHeroPool, setPinnedHeroPool] = useState(panel.heroPool);
  if (heroPinKey !== pinnedHeroKey) {
    setPinnedHeroKey(heroPinKey);
    setPinnedHeroPool(panel.heroPool);
  }
  // Tab change updates pinnedHeroPool above. Refresh keeps the same pin key, so the hero
  // stays put while the server-rendered grid below swaps. Empty first pin keeps retrying.
  const heroPool = pinnedHeroPool.length > 0 ? pinnedHeroPool : panel.heroPool;

  const feedSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (topicParam) feedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [topicParam]);

  const [pending, startTransition] = useTransition();
  const handlePullRefresh = () => {
    const fingerprints = panel.gridFingerprints;
    startTransition(async () => {
      await refreshHomeFeedAction(fingerprints);
      router.refresh();
    });
  };

  return (
    <PullToRefresh refreshing={pending} onRefresh={handlePullRefresh}>
      <div className="home-pad page-enter">
        <div className="home-row">
          <div className="home-main-col">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
              <div>{header}</div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <RefreshHomeFeedButton gridArticleFingerprints={panel.gridFingerprints} />
                {!getTheAppDismissed && <GetTheAppHomeShortcut />}
                <Link href="/search" className="btn btn-secondary btn-icon" aria-label="Search">
                  <SearchIcon size={17} />
                </Link>
              </div>
            </div>

            {banners}

            <div style={{ marginBottom: 20 }} data-tour="daily-dashboard">
              {dashboard}
            </div>

            <div style={{ marginBottom: 20 }} data-tour="limbic-agent">
              {agent}
            </div>

            <div ref={feedSectionRef} style={{ marginBottom: 20, scrollMarginTop: 90 }}>
              {topicParam && topicDisplayLabel && (
                <div className="topic-filter-pill">
                  <span>
                    Showing results for: <strong>{topicDisplayLabel}</strong>
                  </span>
                  <button type="button" aria-label="Clear topic filter" onClick={clearTopicFilter}>
                    <XIcon size={10} />
                  </button>
                </div>
              )}
              <SlidingTabs tabs={TYPE_TABS} active={filter} onChange={setFilter} />
            </div>

            <div data-tour="home-feed">
              {heroPool.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <HeroFeed articles={heroPool} />
                </div>
              )}

              {TYPE_TABS.map((tab) => {
                const isActive = tab.id === filter;
                const tabPanel = panels[tab.id];
                // Only the active tab can be showing a hero pinned from a previous Refresh
                // (switching tabs resets the pin to that tab's own fresh selection — see
                // heroPinKey above), so only its grid needs rechecking against what's
                // actually on screen as hero right now. selectHomeFeed already dedupes a
                // tab's own fresh hero+grid pair against each other server-side; this catches
                // the case that pairing can't see — a grid rotated by Refresh landing on the
                // same image as the hero that Refresh deliberately left in place.
                const effectiveHeroPool = isActive ? heroPool : tabPanel.heroPool;
                const heroImages = new Set(
                  effectiveHeroPool.map((a) => a.image).filter((img): img is string => !!img)
                );
                const gridArticles = isActive
                  ? resolveGridArticles(tabPanel.gridArticles, tabPanel.gridBackfill, heroImages)
                  : tabPanel.gridArticles;
                const showEmptyMessage =
                  tabPanel.emptyMessage && effectiveHeroPool.length === 0 && gridArticles.length === 0;
                return (
                  <div key={tab.id} hidden={!isActive}>
                    {showEmptyMessage && (
                      <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{tabPanel.emptyMessage}</p>
                    )}
                    <div className="cards-grid home-cards-grid">
                      {gridArticles.map((a) => (
                        <ArticleCard key={a.id} article={a} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="home-refresh-pill-wrap">
              <button type="button" className="home-refresh-pill" disabled={pending} onClick={handlePullRefresh}>
                <RefreshIcon size={13} style={pending ? { animation: "spin 0.8s linear infinite" } : undefined} />
                {pending ? "Refreshing…" : "Refresh for more"}
              </button>
            </div>
          </div>

          {aside}
        </div>
      </div>
    </PullToRefresh>
  );
}

/** Home shortcut next to Refresh. Parent already skips this when `getTheAppDismissed`
 *  is true. Standalone/PWA hide is presentation-only (same detection as GetTheAppCard)
 *  so an installed launch does not deep-link at a card Profile has hidden — no DB write.
 *
 *  iOS Safari may briefly paint this before `navigator.standalone` is read; that flash is
 *  the hydration-safe tradeoff, not something to paper over. */
function GetTheAppHomeShortcut() {
  const installed = useStandaloneDisplay();
  const className = installed
    ? "btn btn-secondary btn-icon get-the-app-home-shortcut get-the-app-home-shortcut--installed"
    : "btn btn-secondary btn-icon get-the-app-home-shortcut";

  return (
    <Link
      href="/profile#get-the-app"
      className={className}
      aria-label="Get the app"
      title="Add Limbic to your home screen"
    >
      <DownloadIcon size={16} />
    </Link>
  );
}
