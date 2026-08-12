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
// How close to the bottom edge (in px) still counts as "at the bottom" for starting a
// bottom-edge pull — scrollTop + clientHeight is routinely a fraction of a pixel short of
// scrollHeight from layout rounding even when a reader is visually all the way down, so an
// exact >= comparison would miss real at-the-bottom starts. The top edge doesn't need this
// (scrollTop<=0 is exact — there's no equivalent rounding direction to worry about there).
const BOTTOM_EPSILON = 1;

type Edge = "top" | "bottom";

/**
 * Wraps Home's content with a touch-driven pull-to-refresh affordance at both ends of the
 * scrollable feed — the same gesture every native app/mobile site uses at the top (drag
 * down from the very top, an indicator grows and rotates, releasing past THRESHOLD triggers
 * a refresh), mirrored at the bottom (drag up once you've hit the end, same indicator, same
 * threshold, same refresh) so reaching the end of the feed has its own way back to fresh
 * content instead of a silent stop. Both edges trigger the exact same refresh — this isn't
 * "load more"/pagination, just a second entry point into the identical swap-in-new-cards
 * action RefreshHomeFeedButton already does. A no-op everywhere else — desktop pointers
 * never fire touch events, so nothing here ever engages outside a touchscreen.
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
  const [topPull, setTopPull] = useState(0);
  const [bottomPull, setBottomPull] = useState(0);
  // Off during an active drag (so the indicator tracks the finger 1:1 with no lag), on for
  // every programmatic change (snap-back on release, settling once refreshing finishes) —
  // toggling this is what makes a drag feel immediate but a release feel like it eases in.
  const [animated, setAnimated] = useState(false);
  const startYRef = useRef<number | null>(null);
  // Which edge (if either) the current gesture is tracking — null means either the finger
  // is up, or the drag started mid-scroll (neither edge), which never engages at all.
  const edgeRef = useRef<Edge | null>(null);
  // Mirrors topPull/bottomPull for the touch handlers to read synchronously on release —
  // kept as refs (updated alongside every setTopPull/setBottomPull call below) rather than
  // read via a setState updater's own functional form, since calling `onRefresh` (which
  // calls the parent's startTransition/setState) from inside that updater is exactly the
  // "updating a component while rendering a different component" pattern React disallows —
  // updater functions can run during React's own render/commit work, not just as a plain
  // side effect.
  const topPullRef = useRef(0);
  const bottomPullRef = useRef(0);
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

    const atTop = () => container!.scrollTop <= 0;
    const atBottom = () => container!.scrollTop + container!.clientHeight >= container!.scrollHeight - BOTTOM_EPSILON;

    function resetPull(edge: Edge) {
      if (edge === "top") {
        topPullRef.current = 0;
        setTopPull(0);
      } else {
        bottomPullRef.current = 0;
        setBottomPull(0);
      }
    }

    function handleTouchStart(e: TouchEvent) {
      if (refreshingRef.current) {
        edgeRef.current = null;
        startYRef.current = null;
        return;
      }
      // Picks whichever edge the feed is already resting against — a drag that starts
      // mid-scroll (neither edge) never engages, same as before this had two edges.
      if (atTop()) edgeRef.current = "top";
      else if (atBottom()) edgeRef.current = "bottom";
      else {
        edgeRef.current = null;
        startYRef.current = null;
        return;
      }
      startYRef.current = e.touches[0].clientY;
      setAnimated(false);
    }

    function handleTouchMove(e: TouchEvent) {
      const edge = edgeRef.current;
      if (!edge || startYRef.current == null) return;
      const rawDelta = e.touches[0].clientY - startYRef.current;
      // Top: only a downward drag (+delta) while still at the top counts, the direction a
      // reader's finger actually needs to move to reveal a "pull down" indicator. Bottom is
      // the mirror image — only an upward drag (-delta) while still at the bottom counts.
      const valid = edge === "top" ? rawDelta > 0 && atTop() : rawDelta < 0 && atBottom();
      if (!valid) {
        edgeRef.current = null;
        startYRef.current = null;
        setAnimated(true);
        resetPull(edge);
        return;
      }
      // Claims the gesture only once it's a genuine pull from the edge it started at —
      // otherwise an ordinary scroll or a flick the other way never hits this, so normal
      // scrolling anywhere else on the page is completely unaffected.
      e.preventDefault();
      const magnitude = Math.min(Math.abs(rawDelta) * RESISTANCE, MAX_PULL);
      if (edge === "top") {
        topPullRef.current = magnitude;
        setTopPull(magnitude);
      } else {
        bottomPullRef.current = magnitude;
        setBottomPull(magnitude);
      }
    }

    function handleTouchEnd() {
      const edge = edgeRef.current;
      if (!edge) return;
      edgeRef.current = null;
      startYRef.current = null;
      setAnimated(true);
      const pullRef = edge === "top" ? topPullRef : bottomPullRef;
      const setPull = edge === "top" ? setTopPull : setBottomPull;
      if (pullRef.current >= THRESHOLD && !refreshingRef.current) {
        // Pins just under threshold while the real refresh runs, called as a plain
        // top-level statement (not from inside a setState updater — see topPullRef/
        // bottomPullRef's own comment above for why that distinction matters here).
        onRefresh();
        pullRef.current = THRESHOLD * 0.8;
        setPull(THRESHOLD * 0.8);
      } else {
        pullRef.current = 0;
        setPull(0);
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

  // Settles both indicators back down once the caller's own refresh actually finishes —
  // same "adjust state when a prop changes" pattern components/HomeFeed.tsx's own
  // pinnedHeroKey/pinnedHeroPool use, rather than an effect, since this needs to happen the
  // instant `refreshing` flips, not one render later. Only whichever edge actually triggered
  // the refresh is ever nonzero at this point (the other was never touched this gesture), so
  // resetting both unconditionally is safe. Covers both a real refresh completing and
  // (defensively) refreshing ending without either indicator having pinned anything, e.g. a
  // future caller triggering it some other way.
  const [prevRefreshing, setPrevRefreshing] = useState(refreshing);
  if (refreshing !== prevRefreshing) {
    setPrevRefreshing(refreshing);
    // topPullRef/bottomPullRef aren't touched here (writing a ref during render is itself
    // unsafe, same reasoning as refreshingRef above) — harmless to leave stale, since
    // they're only ever read in handleTouchEnd, and a fresh drag always writes the relevant
    // one via handleTouchMove well before any handleTouchEnd could read it.
    if (!refreshing) {
      setAnimated(true);
      setTopPull(0);
      setBottomPull(0);
    }
  }

  // While actually refreshing, whichever edge triggered it is the one sitting at a nonzero
  // pull (see handleTouchEnd's pin above) — the other was never engaged this gesture, so
  // this is enough to tell them apart without a separate "which edge" ref.
  const topActive = refreshing && topPull > 0;
  const bottomActive = refreshing && bottomPull > 0;
  const topDisplay = topActive ? THRESHOLD * 0.8 : topPull;
  const bottomDisplay = bottomActive ? THRESHOLD * 0.8 : bottomPull;
  const topProgress = Math.min(topPull / THRESHOLD, 1);
  const bottomProgress = Math.min(bottomPull / THRESHOLD, 1);

  return (
    <div ref={rootRef} className="pull-refresh-root">
      {/* Absolutely positioned, always MAX_PULL tall, revealed purely by sliding into view
          via translateY — content below moves by that same topDisplay/bottomDisplay value
          via its own translateY, so the two track in lockstep on one shared scale instead
          of each independently pushing the other (a fixed-height indicator sitting in
          normal flow before/after content would push it *again* on top of the transform,
          doubling the visual travel for a given pull distance — measured and confirmed
          during development, not a hypothetical). */}
      <div
        className="pull-refresh-indicator"
        style={{
          top: 0,
          height: MAX_PULL,
          transform: `translateY(${topDisplay - MAX_PULL}px)`,
          transition: animated ? "transform 200ms ease" : "none",
          opacity: topActive || topPull > 4 ? 1 : 0,
        }}
        aria-hidden="true"
      >
        <RefreshIcon
          size={18}
          style={{
            transform: topActive ? undefined : `rotate(${topProgress * 180}deg)`,
            animation: topActive ? "spin 0.8s linear infinite" : undefined,
            transition: animated ? "transform 200ms ease" : "none",
          }}
        />
      </div>
      <div
        style={{
          transform: `translateY(${topDisplay - bottomDisplay}px)`,
          transition: animated ? "transform 200ms ease" : "none",
        }}
      >
        {children}
      </div>
      <div
        className="pull-refresh-indicator"
        style={{
          bottom: 0,
          height: MAX_PULL,
          transform: `translateY(${MAX_PULL - bottomDisplay}px)`,
          transition: animated ? "transform 200ms ease" : "none",
          opacity: bottomActive || bottomPull > 4 ? 1 : 0,
        }}
        aria-hidden="true"
      >
        <RefreshIcon
          size={18}
          style={{
            transform: bottomActive ? undefined : `rotate(${bottomProgress * 180}deg)`,
            animation: bottomActive ? "spin 0.8s linear infinite" : undefined,
            transition: animated ? "transform 200ms ease" : "none",
          }}
        />
      </div>
    </div>
  );
}
