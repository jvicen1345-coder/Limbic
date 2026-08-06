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

export const WARNING_WINDOW_DAYS = 30;
