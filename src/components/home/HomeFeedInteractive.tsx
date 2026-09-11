"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon, XIcon, DownloadIcon, RefreshIcon } from "@/components/icons";
import { SlidingTabs } from "@/components/SlidingTabs";
import { HeroFeed } from "@/components/HeroFeed";
import { RefreshHomeFeedButton } from "@/components/RefreshHomeFeedButton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { refreshHomeFeedAction } from "@/app/actions/home";
import { TYPE_TABS, type HomeFeedFilter } from "@/lib/home-feed-selection";
import type { DecoratedArticle } from "@/lib/feed";

export type HomeFeedPanel = {
  heroPool: DecoratedArticle[];
  /** Server-rendered grid (and empty-state copy) for this tab. */
  grid: ReactNode;
  gridFingerprints: string[];
};

/**
 * Home's interactive chrome — tabs, topic pill, pull-to-refresh, and Refresh — around
 * server-rendered greeting / panels / aside. Default tab content is already in the HTML;
 * switching tabs only toggles which prebuilt panel is visible (same pattern as
 * WellnessOverviewTabs). Hero pools stay as data so Refresh can rotate the grid without
 * replacing the pinned hero.
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
                {!getTheAppDismissed && (
                  <Link
                    href="/profile#get-the-app"
                    className="btn btn-secondary btn-icon"
                    aria-label="Get the app"
                    title="Add Limbic to your home screen"
                  >
                    <DownloadIcon size={16} />
                  </Link>
                )}
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

              {TYPE_TABS.map((tab) => (
                <div key={tab.id} hidden={tab.id !== filter}>
                  {panels[tab.id].grid}
                </div>
              ))}
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
