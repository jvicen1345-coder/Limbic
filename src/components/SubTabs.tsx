"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SubTab {
  href: string;
  label: string;
}

/** Shared secondary tab bar for a multi-page section (Nexus, LimbicPro, …) — sits at the
 *  top of the page content, mirroring that section's sidebar sub-links so the same
 *  destinations are reachable both places. The first tab is treated as the section's
 *  index route and only matches exactly; the rest match any nested path underneath them. */
export function SubTabs({ tabs }: { tabs: SubTab[] }) {
  const pathname = usePathname();
  const indexHref = tabs[0]?.href;
  return (
    <div className="sub-tabs">
      {tabs.map((t) => {
        const active = t.href === indexHref ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? "sub-tab active" : "sub-tab"}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
