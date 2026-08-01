"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/nexus", label: "Feed" },
  { href: "/nexus/directory", label: "Directory" },
  { href: "/nexus/connections", label: "Connections" },
  { href: "/nexus/messages", label: "Messages" },
];

export function NexusTabs() {
  const pathname = usePathname();
  return (
    <div className="nexus-tabs">
      {TABS.map((t) => {
        const active = t.href === "/nexus" ? pathname === "/nexus" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? "nexus-tab active" : "nexus-tab"}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
