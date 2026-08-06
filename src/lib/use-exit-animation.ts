import { useEffect, useState } from "react";

/** Keeps a conditionally-rendered element mounted for `exitMs` after `open` goes false, so
 *  it can play a CSS slide/fade-out before actually unmounting (see .cal-panel-closing/
 *  .cal-modal-closing in globals.css) — used by the calendar's detail panel and Add Event
 *  modal, both of which need a real "closing" transition rather than an instant unmount.
 *
 *  `open` is compared against a tracked copy of itself and state is adjusted directly
 *  during render on a change (React's documented pattern for "adjust state when a prop
 *  changes") rather than inside a useEffect body, since this repo's lint config forbids a
 *  synchronous setState call there. The effect below only ever starts a timer — it never
 *  calls setState synchronously in its own body, only later from the timeout callback. */
export function useExitAnimation(open: boolean, exitMs: number) {
  const [shouldRender, setShouldRender] = useState(open);
  const [closing, setClosing] = useState(false);
  const [trackedOpen, setTrackedOpen] = useState(open);

  if (open !== trackedOpen) {
    setTrackedOpen(open);
    if (open) {
      setShouldRender(true);
      setClosing(false);
    } else {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setShouldRender(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [closing, exitMs]);

  return { shouldRender, closing };
}
