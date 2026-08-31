/** Shared types for the full /calendar page (see app/(app)/calendar/page.tsx,
 *  lib/calendar-data.ts, app/actions/calendar.ts, components/calendar/*) — kept free of
 *  server-only imports so client components can import from here too, same convention as
 *  lib/limbic-calendar.ts (which this builds on for the sidebar-widget-shared pieces:
 *  PERSONAL_DEADLINE_FIELDS, ProfessionalDateField, isEventPost, day-math helpers). */

import type { ProfessionalDateField } from "@/lib/limbic-calendar";

export type CalendarEventKind = "personal" | "platform" | "community" | "user";

/** The header's filter buttons — one bucket per pill color. There's no separate "User
 *  Created" button: user-created events render as orange pills alongside personal
 *  deadlines ("Orange pills — personal deadlines and user created events" per spec), so
 *  they fall into the "personal" bucket for filtering purposes too. */
export const CALENDAR_FILTERS = ["all", "personal", "platform", "community"] as const;
export type CalendarFilter = (typeof CALENDAR_FILTERS)[number];

export const CALENDAR_FILTER_LABEL: Record<CalendarFilter, string> = {
  all: "All",
  personal: "Personal",
  platform: "PT Events",
  community: "Limbic Events",
};

export function filterBucketForKind(kind: CalendarEventKind): Exclude<CalendarFilter, "all"> {
  if (kind === "platform") return "platform";
  if (kind === "community") return "community";
  return "personal";
}

export type CalendarView = "month" | "week" | "list";
export const CALENDAR_VIEWS: { id: CalendarView; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "list", label: "List" },
];

/** The Add Event modal's Event Type select — free-text on the UserCalendarEvent row (see
 *  prisma/schema.prisma), whitelisted here and in app/actions/calendar.ts rather than a DB
 *  enum, same "no DB-level constraint, whitelist enforced server-side" approach as every
 *  other free-text field in this schema. */
export const USER_EVENT_TYPES = ["Class", "Personal", "CE Event", "Conference", "Rotation", "Other"] as const;
export type UserEventType = (typeof USER_EVENT_TYPES)[number];

/** Short day-of-week codes for Syllabus.meetingDays (see prisma/schema.prisma and
 *  lib/syllabus-parser.ts) — whitelisted here and in app/actions/syllabus.ts for the same
 *  "no DB-level enum, whitelist enforced server-side" reasoning as USER_EVENT_TYPES above.
 *  Weekdays only — classes don't meet Sat/Sun, so the day picker (and what the AI parser is
 *  allowed to extract) is scoped to Mon-Fri from the start rather than offering choices that
 *  would never be real. Mon-first order throughout — the app's week always starts Monday
 *  (see getThisWeekDateRange), so this doubles as the display order everywhere it's rendered. */
export const MEETING_DAY_CODES = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export type MeetingDayCode = (typeof MEETING_DAY_CODES)[number];

interface BaseCalendarEvent {
  id: string;
  /** ISO "YYYY-MM-DD". */
  date: string;
  title: string;
}

export interface PersonalCalendarEvent extends BaseCalendarEvent {
  kind: "personal";
  field: ProfessionalDateField;
  /** Pre-built "License expires" / "CEU deadline is" lead-in — see
   *  PERSONAL_DEADLINE_FIELDS in lib/limbic-calendar.ts. */
  countdownVerb: string;
}

export interface PlatformCalendarEvent extends BaseCalendarEvent {
  kind: "platform";
  articleId: string;
  source: string;
  readMins: number;
}

export interface CommunityCalendarEvent extends BaseCalendarEvent {
  kind: "community";
  bodyPreview: string;
  authorName: string;
  postHref: string;
}

export interface UserCreatedCalendarEvent extends BaseCalendarEvent {
  kind: "user";
  /** The underlying UserCalendarEvent row's own id, without the `user-` prefix `id` above
   *  carries (every CalendarEvent kind is prefixed so ids stay unique across kinds — see
   *  lib/calendar-data.ts) — this is what the edit/delete server actions take. */
  rawId: string;
  type: string;
  notes: string | null;
  reminder: boolean;
}

export type CalendarEvent = PersonalCalendarEvent | PlatformCalendarEvent | CommunityCalendarEvent | UserCreatedCalendarEvent;
