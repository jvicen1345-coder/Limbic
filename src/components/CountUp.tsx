"use client";

import { useEffect, useRef, useState } from "react";

/** Animates counting up from 0 to `value` over `durationMs` on mount — a presentational
 *  entrance effect only. `value` itself is already fully computed by the caller (see
 *  DailyDashboard's Day Streak tile); this never fetches or derives anything, just
 *  changes how an already-known number gets drawn on screen. */
export function CountUp({ value, durationMs = 600 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // Initial state is already 0, which is exactly the target here — nothing to animate
    // or otherwise set.
    if (value <= 0) return;
    let raf = 0;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min(1, (ts - startRef.current) / durationMs);
      setDisplay(Math.round(progress * value));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <>{display}</>;
}
