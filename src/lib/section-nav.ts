import type { SubTab } from "@/components/SubTabs";

// Shared tab lists for multi-page sections — kept in one place so the sidebar's sub-links
// (AppShell) and each section's in-page tab bar (SubTabs) never drift out of sync.

export const NEXUS_TABS: SubTab[] = [
  { href: "/nexus", label: "Feed" },
  { href: "/nexus/directory", label: "Directory" },
  { href: "/nexus/connections", label: "Connections" },
  { href: "/nexus/messages", label: "Messages" },
];

// LimbicPro's Overview no longer has a sibling Membership page of its own — Membership
// moved under Profile (see PROFILE_TABS below, app/(app)/profile/membership/page.tsx) —
// but this one-item list stays so /pro's own SubTabs bar still renders (and still links
// out to where Membership actually lives now) rather than needing its own special case.
export const PRO_TABS: SubTab[] = [
  { href: "/pro", label: "Overview" },
  { href: "/profile/membership", label: "Membership" },
];

export const PROFILE_TABS: SubTab[] = [
  { href: "/profile", label: "Profile" },
  { href: "/profile/credentials", label: "Credentials" },
  { href: "/profile/membership", label: "Membership" },
  { href: "/calendar", label: "Calendar" },
];

export const NEWS_TABS: SubTab[] = [
  { href: "/news", label: "APTA" },
  { href: "/news/general", label: "General" },
];
