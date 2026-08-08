import { useEffect, useState } from "react";

/** Below this width, Body Connections switches from the desktop two-column click-to-match
 *  layout to the mobile sequential one (see components/BodyConnectionsGame.tsx) — the two
 *  column layout doesn't work on a narrow screen. Matches the CSS media query breakpoint
 *  the same component's stylesheet uses, so the JS interaction pattern and the CSS layout
 *  switch at the same point. */
const MOBILE_BREAKPOINT = 768;

/** True below MOBILE_BREAKPOINT. Always starts false — matching what SSR renders, since
 *  there's no viewport to measure on the server — and syncs to the real value once mounted.
 *  Reading `window.innerWidth` in the initial state itself (rather than from inside the
 *  effect) would make the very first *client* render disagree with the server-rendered HTML
 *  on an actually-narrow viewport, which is a hydration mismatch, not just a brief flash of
 *  the wrong layout. The sync happens through a named callback rather than a bare
 *  `setIsMobile(...)` statement so it reads as "subscribe to an external system, setState in
 *  its callback" to the react-hooks/set-state-in-effect rule, not a synchronous set. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (matches: boolean) => setIsMobile(matches);
    onChange(mql.matches);
    const listener = (e: MediaQueryListEvent) => onChange(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return isMobile;
}
