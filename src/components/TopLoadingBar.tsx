"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** A thin progress bar at the very top of the screen that runs during page navigation —
 *  the only feedback a tap gets otherwise on a route with no loading.tsx (most of the app;
 *  see the handful of new loading.tsx files under app/(app)/*), where nothing else changes
 *  on screen until the destination page's data finishes fetching.
 *
 *  Starts on click, not on a pathname change: usePathname() only updates once the
 *  destination route has actually committed, which for a route with no Suspense boundary
 *  is the same instant its content appears — reacting to that alone would start and finish
 *  the bar together, never actually visible during the wait it's meant to cover. Listening
 *  for the click that triggers navigation instead means the bar appears the moment a tap
 *  registers; the pathname change (below) is only used to know when to complete it. */
export function TopLoadingBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const growTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  // Fires whenever the committed route changes — i.e. navigation just finished. The
  // width-100 update is deferred a frame (rather than called directly in the effect body)
  // so it happens as a reaction, not as a synchronous render-cascading setState.
  useEffect(() => {
    if (growTimer.current != null) {
      window.clearTimeout(growTimer.current);
      growTimer.current = null;
    }
    const raf = window.requestAnimationFrame(() => {
      setWidth((w) => (w > 0 ? 100 : 0));
    });
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 200);
    return () => {
      window.cancelAnimationFrame(raf);
      if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // External links, and a link back to the page already showing, never trigger an
      // in-app navigation — no bar for either.
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
      setVisible(true);
      setWidth(15);
      growTimer.current = window.setTimeout(() => setWidth(75), 400);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!visible) return null;

  return <div aria-hidden="true" className="top-loading-bar" style={{ width: `${width}%` }} />;
}
