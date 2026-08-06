"use client";

import { useLayoutEffect, useRef, useState } from "react";

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

  useLayoutEffect(() => {
    const activeEl = containerRef.current?.querySelector<HTMLElement>(`[data-tab-id="${active}"]`);
    if (!activeEl) return;
    setUnderline({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
  }, [active, tabs]);

  return (
    <div ref={containerRef} className="sliding-tabs">
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
