/** The Home page's right-sidebar widgets a reader can hide (see components/HomeFeed.tsx and
 *  the "Home page widgets" section on Profile). Single source of truth for both the Profile
 *  toggle list and HomeFeed's own filtering, so the two can never drift out of sync. */
export const HOME_WIDGETS = [
  { id: "continueReading", label: "Continue Reading" },
  { id: "homeQuestion", label: "Question of the Day" },
  { id: "savedUnread", label: "Saved, still unread" },
  { id: "calendar", label: "CE & Events calendar" },
  { id: "dailyInsight", label: "Daily insight" },
  /** Admin-only while Nexus's future is being decided — see lib/nexus-visibility.ts. A
   *  non-admin must not even see the toggle, or the list would name a feature they have no
   *  other way of knowing exists. */
  { id: "nexus", label: "Nexus", adminOnly: true },
] as const;

export type HomeWidgetId = (typeof HOME_WIDGETS)[number]["id"];

/** The widgets to offer this reader on Profile. Filtered rather than hidden with CSS, so a
 *  non-admin's page source never mentions Nexus either. */
export function homeWidgetsFor(isAdmin: boolean) {
  return HOME_WIDGETS.filter((w) => isAdmin || !("adminOnly" in w && w.adminOnly));
}
