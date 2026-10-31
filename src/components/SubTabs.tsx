"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockIcon } from "@/components/icons";

export interface SubTab {
  href: string;
  label: string;
  /** Shown, still linked, with the same lock pill the sidebar used to put on the row. */
  locked?: boolean;
  lockLabel?: string;
}

/** The section index (first tab) matches only its own path, so /student/soap does not
 *  light Atrium. Every other tab also matches nested routes, and the longest href wins
 *  when more than one could (/nexus vs /nexus/messages/[id]). */
function tabMatches(pathname: string, href: string, index: boolean) {
  if (pathname === href) return true;
  return !index && pathname.startsWith(`${href}/`);
}

/** Shared secondary tab bar for a multi-page section. */
export function SubTabs({ tabs }: { tabs: SubTab[] }) {
  const pathname = usePathname();
  let activeHref: string | null = null;
  tabs.forEach((tab, index) => {
    if (!tabMatches(pathname, tab.href, index === 0)) return;
    if (!activeHref || tab.href.length > activeHref.length) activeHref = tab.href;
  });
  return (
    <div className="sub-tabs">
      {tabs.map((tab) => {
        const active = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "sub-tab active" : "sub-tab"}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
            {tab.locked ? (
              <span className="tag tag-accent sub-tab-lock">
                <LockIcon size={10} />
                {tab.lockLabel ?? "PRO"}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
