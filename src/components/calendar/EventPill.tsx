"use client";

import { filterBucketForKind, type CalendarEvent } from "@/lib/calendar-events";

/** A single event's pill in a month-grid cell (see CalendarMonthView) — color comes from
 *  filterBucketForKind so a user-created event (kind "user") renders identically to a
 *  personal deadline, per spec ("orange pills — personal deadlines and user created
 *  events"). Stops propagation so clicking a pill opens that specific event rather than
 *  also triggering the day cell's own onClick. */
export function EventPill({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`cal-pill cal-pill-${filterBucketForKind(event.kind)}`}
      title={event.title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {event.title}
    </button>
  );
}
