/** Shared types/helpers for the Limbic Calendar widget (see
 *  components/LimbicCalendarWidget.tsx, components/LimbicCalendarWidgetClient.tsx) — kept
 *  free of server-only imports (no `prisma`, no `server-only`) so the client component can
 *  import from here too. */

import { todayLocalDateStr } from "@/lib/today";

export type CalDotKind = "personal" | "platform" | "community";

export interface CalDot {
  id: string;
  /** ISO "YYYY-MM-DD", same key format CalendarCard already used. */
  date: string;
  kind: CalDotKind;
  title: string;
  description?: string;
  href?: string;
}

export const CAL_DOT_KIND_LABEL: Record<CalDotKind, string> = {
  personal: "Personal Deadline",
  platform: "PT Event",
  community: "Limbic Event",
};

/** Same local-clock convention as todayLocalDateStr, for a stored DateTime value rather
 *  than "now" — deliberately not `.toISOString().slice(0, 10)`, which reads off UTC and
 *  can land on the wrong day near midnight in any timezone behind UTC. */
export function dateToLocalIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Whole-day difference between an ISO date and today — positive for a future date,
 *  negative for a past one. Computed off local-midnight Date objects (not raw ms) so DST
 *  transitions don't shift the count by an hour into the wrong day. */
export function daysUntil(iso: string): number {
  const today = new Date(todayLocalDateStr() + "T00:00:00");
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function daysRemainingLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days === 0) return "Today";
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

/** Same idea as daysRemainingLabel, phrased for the full /calendar page's detail panel
 *  ("23 days remaining" / "Past due") instead of the sidebar widget's inline-sentence
 *  phrasing — kept as a separate function rather than a shared one with a `style` flag so
 *  neither caller has to know the other's wording exists. */
export function daysRemainingOrPastDue(iso: string): string {
  const days = daysUntil(iso);
  if (days === 0) return "Today";
  if (days < 0) return "Past due";
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export const WARNING_WINDOW_DAYS = 30;

/** The orange-pill/dot personal deadlines (see the Profile "Professional Dates" section,
 *  app/actions/profile.ts updateProfessionalDates) — one entry per User date field, shared
 *  by the sidebar LimbicCalendarWidget and the full /calendar page so both list exactly
 *  the same fields with exactly the same wording. `title` is the noun shown as a heading;
 *  `verb` builds a "License expires in 23 days"-style countdown sentence (title alone
 *  wouldn't read as a sentence for every field — "CEU Deadline in 10 days" is off, "CEU
 *  deadline is in 10 days" reads right). */
export type ProfessionalDateField =
  | "npteExamDate"
  | "ceuDeadline"
  | "licenseExpiration"
  | "certificationExpiry"
  | "rotationStartDate"
  | "rotationEndDate"
  | "graduationDate"
  | "practiceStartDate";

export const PERSONAL_DEADLINE_FIELDS: { field: ProfessionalDateField; title: string; verb: string }[] = [
  { field: "npteExamDate", title: "NPTE Exam", verb: "NPTE Exam is" },
  { field: "licenseExpiration", title: "License Renewal", verb: "License expires" },
  { field: "ceuDeadline", title: "CEU Deadline", verb: "CEU deadline is" },
  { field: "certificationExpiry", title: "Certification Expires", verb: "Certification expires" },
  { field: "rotationStartDate", title: "Rotation Starts", verb: "Rotation starts" },
  { field: "rotationEndDate", title: "Rotation Ends", verb: "Rotation ends" },
  { field: "graduationDate", title: "Graduation", verb: "Graduation is" },
  { field: "practiceStartDate", title: "Practice Anniversary", verb: "Practice anniversary is" },
];

/** NexusPost has no event-tag field (see prisma/schema.prisma) — this keyword heuristic
 *  stands in for one, matching the same "classify by keyword" pattern lib/news-live.ts
 *  already uses for CE articles. Shared by the sidebar widget and the full /calendar page
 *  so a post never counts as an event on one and not the other. */
export const COMMUNITY_EVENT_KEYWORDS = ["webinar", "conference", "csm", "symposium", "event", "seminar"];

export function isEventPost(body: string, articleTitle: string | null): boolean {
  const text = `${body} ${articleTitle ?? ""}`.toLowerCase();
  return COMMUNITY_EVENT_KEYWORDS.some((kw) => text.includes(kw));
}
