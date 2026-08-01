import type { SubTab } from "@/components/SubTabs";

// Shared tab lists for multi-page sections — kept in one place so the sidebar's sub-links
// (AppShell) and each section's in-page tab bar (SubTabs) never drift out of sync.

export const NEXUS_TABS: SubTab[] = [
  { href: "/nexus", label: "Feed" },
  { href: "/nexus/directory", label: "Directory" },
  { href: "/nexus/connections", label: "Connections" },
  { href: "/nexus/messages", label: "Messages" },
];

export const PRO_TABS: SubTab[] = [
  { href: "/pro", label: "Overview" },
  { href: "/pro/membership", label: "Membership" },
];
