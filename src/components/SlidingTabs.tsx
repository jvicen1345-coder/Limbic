"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Home's type-filter row (All/Research/Guidelines/…) — same underlying click/state
 *  contract as swapping Chips (the caller still owns `active`/`onChange`, this is purely
 *  how the choice gets drawn), but with a single underline element that slides to the
 *  newly-active tab instead of each tab just snapping into its own active style. Measures
 *  the active button's position with a ref/layout effect rather than a CSS-only trick,
 *  since tab labels are variable-width text. */
export function SlidingTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);
  const [scrollable, setScrollable] = useState(false);

  useLayoutEffect(() => {
    const activeEl = containerRef.current?.querySelector<HTMLElement>(`[data-tab-id="${active}"]`);
    if (!activeEl) return;
    setUnderline({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
  }, [active, tabs]);

  /** Whether the strip is actually wider than its box, published to CSS as
   *  `data-scrollable` (see .sliding-tabs[data-scrollable="true"] in globals.css).
   *
   *  It gates `touch-action: pan-x`, which is what stops a sideways swipe across the tabs
   *  from dragging the page up and down with it — and which has a real cost, because it
   *  also stops a finger that lands on the strip from scrolling the page vertically. That
   *  trade is worth making on a rail you have to swipe (Clinical Reference's runs 573px
   *  past the viewport at 390px, Home's 241px) and not worth it on one that fits (Exercise
   *  Programs and the wellness exercise library both measure 0 overflow at that width),
   *  where it would take away vertical scrolling and give nothing back. CSS can't ask
   *  whether an element overflows, so the component answers for it.
   *
   *  Observed rather than measured once: the same strip overflows or doesn't depending on
   *  viewport width, so rotating a phone or resizing has to flip this. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <div ref={containerRef} className="sliding-tabs" data-scrollable={scrollable ? "true" : undefined}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          data-tab-id={t.id}
          className={active === t.id ? "sliding-tab active" : "sliding-tab"}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
      {underline && (
        <div
          className="sliding-tab-underline"
          style={{ transform: `translateX(${underline.left}px)`, width: underline.width }}
        />
      )}
    </div>
  );
}
