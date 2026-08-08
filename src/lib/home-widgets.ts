/** The Home page's right-sidebar widgets a reader can hide (see components/HomeFeed.tsx and
 *  the "Home page widgets" section on Profile). Single source of truth for both the Profile
 *  toggle list and HomeFeed's own filtering, so the two can never drift out of sync. */
export const HOME_WIDGETS = [
  { id: "continueReading", label: "Continue Reading" },
  { id: "homeQuestion", label: "Question of the Day" },
  { id: "savedUnread", label: "Saved, still unread" },
  { id: "calendar", label: "CE & Events calendar" },
  { id: "nexus", label: "Nexus" },
  { id: "stock", label: "PT Industry Index" },
  { id: "news", label: "Latest news" },
] as const;

export type HomeWidgetId = (typeof HOME_WIDGETS)[number]["id"];
