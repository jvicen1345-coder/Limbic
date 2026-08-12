"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshIcon } from "@/components/icons";

// How far a finger has to actually travel (in real screen px) before release triggers a
// refresh — matches the ballpark other apps use (Twitter/Instagram sit around 60-80px).
const THRESHOLD = 64;
// The indicator never pulls further than this, no matter how far the finger travels — same
// "diminishing return" feel every native pull-to-refresh has.
const MAX_PULL = 80;
// Raw finger movement is scaled down before it reaches the indicator — pulling stops feeling
// 1:1 with your finger the further you drag, the same rubber-band feel as a native scroll
// view's own overscroll.
const RESISTANCE = 0.5;

/**
 * Wraps Home's content with a touch-driven pull-to-refresh affordance, the same gesture
 * every native app/mobile site uses: drag down from the very top of the scrollable feed,
 * an indicator grows and rotates as you pull, and releasing past THRESHOLD triggers a
 * refresh. A no-op everywhere else — desktop pointers never fire touch events, so nothing
 * here ever engages outside a touchscreen, and Home already has RefreshHomeFeedButton for
 * that case.
 *
 * `refreshing` is controlled by the caller (see HomeFeed.tsx, which drives it off
 * useTransition's own pending flag — the same mechanism RefreshHomeFeedButton already uses)
 * rather than tracked locally, so the indicator only actually settles back down once the
 * real refresh (server action + router.refresh()) has finished, not on a guessed timeout.
 */
export function PullToRefresh({
  refreshing,
  onRefresh,
  children,
}: {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  // Off during an active drag (so the indicator tracks the finger 1:1 with no lag), on for
  // every programmatic change (snap-back on release, settling once refreshing finishes) —
  // toggling this is what makes a drag feel immediate but a release feel like it eases in.
  const [animated, setAnimated] = useState(false);
  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  // Mirrors `pullDistance` for the touch handlers to read synchronously on release — kept
  // as a ref (updated alongside every setPullDistance call below) rather than read via
  // setPullDistance's own functional-updater form, since calling `onRefresh` (which calls
  // the parent's startTransition/setState) from inside that updater is exactly the
  // "updating a component while rendering a different component" pattern React disallows —
  // updater functions can run during React's own render/commit work, not just as a plain
  // side effect.
  const pullDistanceRef = useRef(0);
  // Read inside the native touch handlers below instead of closed over — those only get
  // re-registered when `onRefresh` itself changes (see the effect's own dep array), so a
  // closed-over `refreshing` could go stale for renders in between. Synced via an effect
  // (not during render, which is itself unsafe for a ref write) — same pattern
  // components/ClipsFeed.tsx's activeRef/onEndedRef use for the same reason.
  const refreshingRef = useRef(refreshing);
  useEffect(() => {
    refreshingRef.current = refreshing;
  });

  useEffect(() => {
    const root = rootRef.current;
    // This component's own root div is the direct child AppShell mounts inside .app-main
    // (see components/AppShell.tsx) — that's the real scrollable element (the page itself
    // never scrolls; .app-main owns its own overflow-y), so this reaches one level up
    // rather than needing a ref threaded all the way down from AppShell for a single page's
    // use of it.
    const container = root?.parentElement;
    if (!root || !container) return;

    function handleTouchStart(e: TouchEvent) {
      if (refreshingRef.current || container!.scrollTop > 0) {
        startYRef.current = null;
        draggingRef.current = false;
        return;
      }
      startYRef.current = e.touches[0].clientY;
      draggingRef.current = true;
      setAnimated(false);
    }

    function handleTouchMove(e: TouchEvent) {
      if (!draggingRef.current || startYRef.current == null) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0 || container!.scrollTop > 0) {
        draggingRef.current = false;
        startYRef.current = null;
        setAnimated(true);
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }
      // Claims the gesture only once it's a genuine downward pull from the top — otherwise
      // an ordinary scroll or an upward flick never hits this, so normal scrolling anywhere
      // else on the page is completely unaffected.
      e.preventDefault();
      const next = Math.min(delta * RESISTANCE, MAX_PULL);
      pullDistanceRef.current = next;
      setPullDistance(next);
    }

    function handleTouchEnd() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      startYRef.current = null;
      setAnimated(true);
      if (pullDistanceRef.current >= THRESHOLD && !refreshingRef.current) {
        // Pins just under threshold while the real refresh runs, called as a plain
        // top-level statement (not from inside a setState updater — see pullDistanceRef's
        // own comment above for why that distinction matters here).
        onRefresh();
        pullDistanceRef.current = THRESHOLD * 0.8;
        setPullDistance(THRESHOLD * 0.8);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onRefresh]);

  // Settles the indicator back down once the caller's own refresh actually finishes — same
  // "adjust state when a prop changes" pattern components/HomeFeed.tsx's own
  // pinnedHeroKey/pinnedHeroPool use, rather than an effect, since this needs to happen the
  // instant `refreshing` flips, not one render later. Covers both a real refresh completing
  // and (defensively) refreshing ending without this component having pinned anything, e.g.
  // a future caller triggering it some other way.
  const [prevRefreshing, setPrevRefreshing] = useState(refreshing);
  if (refreshing !== prevRefreshing) {
    setPrevRefreshing(refreshing);
    // pullDistanceRef isn't touched here (writing a ref during render is itself unsafe,
    // same reasoning as refreshingRef above) — harmless to leave stale, since it's only
    // ever read in handleTouchEnd, and a fresh drag always writes it via handleTouchMove
    // well before any handleTouchEnd could read it.
    if (!refreshing) {
      setAnimated(true);
      setPullDistance(0);
    }
  }

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div ref={rootRef} className="pull-refresh-root">
      <div
        className="pull-refresh-indicator"
        style={{
          height: refreshing ? THRESHOLD * 0.8 : pullDistance,
          transition: animated ? "height 200ms ease" : "none",
          opacity: refreshing || pullDistance > 4 ? 1 : 0,
        }}
        aria-hidden="true"
      >
        <RefreshIcon
          size={18}
          style={{
            transform: refreshing ? undefined : `rotate(${progress * 180}deg)`,
            animation: refreshing ? "spin 0.8s linear infinite" : undefined,
            transition: animated ? "transform 200ms ease" : "none",
          }}
        />
      </div>
      <div
        style={{
          transform: `translateY(${refreshing ? THRESHOLD * 0.8 : pullDistance}px)`,
          transition: animated ? "transform 200ms ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
